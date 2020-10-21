from bs4 import BeautifulSoup
import requests as req
import json, os.path

if not os.path.isfile("./data.json"):
    baseLink = "https://the-familiar.fandom.com"
    bookListPage = req.get(baseLink + "/wiki/Category:Volumes")
    bookListPageSoup = BeautifulSoup(bookListPage.text, "lxml")

    data = {"colors":{
		"Xanther Ibrahim": { "primary": "#F7B7C7", "secondary": "#201C1A" },
		"Jingjing": { "primary": "#01ACE0", "secondary": "#E90280" },
		"Luther Perez": { "primary": "#231F1C", "secondary": "#FBE445" },
		"Anwar Ibrahim": { "primary": "#569254", "secondary": "#CA5A24" },
		"Astair Ibrahim": { "primary": "#F7831C", "secondary": "#FADCB1" },
		"Isand\u00f2rno": { "primary": "#ECCE52", "secondary": "#813E19" },
		"\u00d6zg\u00fcr Yildirim": { "primary": "#855912", "secondary": "#BBBCB4" },
		"The Wizard": { "primary": "#A7A8A2", "secondary": "#79555C" },
		"Shnorhk Zildjian": { "primary": "#BE4935", "secondary": "#7D9AC5" }
    }}
    
    data["books"] = []

    for element in bookListPageSoup.find_all(
        "a", attrs={"class": "category-page__member-link"}
    ):
        volume = (element.text.split(":", 1)[0]).replace("Volume ", "")
        title = element.text.split(": ", 1)[1]

        chapterCount = 1;
        chapters = []
        bookPage = req.get(baseLink + element["href"])
        bookPageSoup = BeautifulSoup(bookPage.text, "lxml")
        for tag in bookPageSoup.find(
            "span", attrs={"id": "Chapters"}
        ).parent.next_siblings:
            if tag.name == "h2":
                break
            else:
                if tag != None:
                    if tag.name != None:
                        for li in tag.find_all("li"):
                            if li.a:
                                chapterPage = req.get(li.a["href"])
                                chapterPageSoup = BeautifulSoup(
                                    chapterPage.text, "lxml"
                                )
                                narrator = ""
                                start = ""
                                end = ""
                                summary = ""

                                print(li.a)
                                summaryComponent = chapterPageSoup.find(
                                    "span", attrs={"id": "Summary"}
                                )
                                
                                if(summaryComponent!=None):
                                    for chapterTag in summaryComponent.parent.next_siblings:
                                        if chapterTag.name == "h3":
                                            break
                                        else:
                                            if chapterTag != None:
                                                if chapterTag.name == "p":
                                                    summary += str(chapterTag.text)

                                    for tr in chapterPageSoup.find_all("tr"):
                                        if str(tr.th.text).rstrip() == "Narrator":
                                            narrator = str(tr.th.next_sibling.text).rstrip()
                                        elif str(tr.th.text).rstrip() == "Starts":
                                            start = str(tr.th.next_sibling.text).rstrip()
                                        elif str(tr.th.text).rstrip() == "Ends":
                                            end = str(tr.th.next_sibling.text).rstrip()

                                    chapters.append(
                                        {
                                            "title": li.a.text,
                                            "chapter":chapterCount,
                                            "narrator": narrator,
                                            "start": start,
                                            "end": end,
                                            "summary": summary,
                                        }
                                    )
                                else:
                                    chapters.append({"title": li.text, "chapter":chapterCount})
                            else:
                                chapters.append({"title": li.text, "chapter":chapterCount})
                            chapterCount += 1;

        data["books"].append({"volume": volume, "title": title, "chapters": chapters})
    with open("data.json", "w") as outfile:
        json.dump(data, outfile)

else:
    print("Data already created!")
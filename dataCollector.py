from bs4 import BeautifulSoup
import requests as req
import json, os.path

if not os.path.isfile("./data.json"):
    baseLink = "https://the-familiar.fandom.com"
    bookListPage = req.get(baseLink + "/wiki/Category:Volumes")
    bookListPageSoup = BeautifulSoup(bookListPage.text, "lxml")

    data = {}
    data["books"] = []

    for element in bookListPageSoup.find_all(
        "a", attrs={"class": "category-page__member-link"}
    ):
        volume = (element.text.split(":", 1)[0]).replace("Volume ", "")
        title = element.text.split(": ", 1)[1]

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
                                            "narrator": narrator,
                                            "start": start,
                                            "end": end,
                                            "summary": summary,
                                        }
                                    )
                                else:
                                    chapters.append({"title": li.text})
                            else:
                                chapters.append({"title": li.text})

        data["books"].append({"volume": volume, "title": title, "chapters": chapters})
    with open("data.json", "w") as outfile:
        json.dump(data, outfile)

else:
    print("Data already created!")
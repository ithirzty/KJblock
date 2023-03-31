// ==UserScript==
// @name         [ONCHE] KJblock
// @namespace    http://tampermonkey.net/
// @version      0.23
// @run-at       document-start
// @description  try to take over the world!
// @author       Ordinateur
// @match        https://onche.org/forum/*
// @match        https://onche.org/topic/*
// @icon         https://image.noelshack.com/fichiers/2016/47/1479837070-risitasprisonneutre.jpg
// @downloadURL  https://github.com/ithirzty/KJblock/raw/main/kjblock.user.js
// @updateURL    https://github.com/ithirzty/KJblock/raw/main/kjblock.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

function isInside(e, arr) {
    for(let i=0;i<arr.length;i++) {
        if (e == arr[i]) {
            return true
        }
    }
    return false
}

function removeSticker(s) {
    s.querySelector("img").src = "https://image.noelshack.com/fichiers/2018/25/6/1529783502-404.png"
    let e = s
    while (e.parentElement && !e.classList.contains("message")) {
        e = e.parentElement
    }
    e.querySelector(".avatar").src = "https://image.noelshack.com/fichiers/2016/47/1479837070-risitasprisonneutre.jpg"
}


(function() {
    'use strict';
    window.addEventListener('load', script)
})()

function script() {
    // GM_deleteValue("collections")
    // GM_deleteValue("stickers")
    let blacklist = ["kj", "mya", "megumin", "ritsu", "mokou", "bocchi", "touhou", "koi", "byakuren", "sanae", "kokomi", "nana", "foxy", "childe", "kaguya", "chika", "adf", "millefi", "fofolle", "hatsune", "miku",
                    "madeline", "menhera", "mashiro", "kanna", "lucy", "aza", "malina", "modeus", "waifu", "shemale", "shuten", "gawr", "chibbi", "kiana", "kissou", "kequing", "koko", "ritsu", "trap", "grr", "saya",
                     "sakuya", "patchouli", "yukari", "sylph", "reimu", "cirno", "reisen", "marisa", "yukari", "futo", "yuyuko", "momiji", "jahy", "hibiki", "sugoi", "konata", "murata", "chuya", "sasu", "yaoi"]
    let collections = (GM_getValue("collections") != undefined ? GM_getValue("collections") : [44])
    let stickers = (GM_getValue("stickers") != undefined ? GM_getValue("stickers") : [])

    function isBlacklisted(name) {
        name = name.toLowerCase()
        for (let i=0; i < blacklist.length; i++) {
                if (name.includes(blacklist[i])) {
                    return true
                }
            }
        return false
    }

    function blacklistCollection(id) {
        fetch("https://onche.org/stickers/collection/"+id+"/list", {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:111.0) Gecko/20100101 Firefox/111.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": window.location.href,
            "method": "GET",
            "mode": "cors"
        }).then(r=>{r.json().then(j=>{
            let count = 0
            j.stickers.forEach(s=>{
                if (isBlacklisted(s.name)) {
                    count++
                }
            })
            let perc = count / j.stickers.length * 100
            if (isBlacklisted(j.name)) {
                perc += 80
            }
            perc = Math.min(perc, 100)
            console.log("Collection "+j.name+" ("+id+") is KJ at "+perc+"%")
            if (perc >= 25) {
                collections.push(id)
                GM_setValue("collections", collections)
            }
        })})
    }
    console.log(collections)
    console.log(stickers)

    document.querySelectorAll(".sticker").forEach(s=>{
        let name = s.getAttribute("data-name")

        //temp blacklist
        if (isInside(name, ["DanceParty"])) {
            removeSticker(s)
            return
        }

        if (!isInside(name, stickers) && !isInside(parseInt(s.getAttribute("data-collection")), collections)) {
            if (isBlacklisted(name)) {
                if (!isInside(parseInt(s.getAttribute("data-collection")), collections)) {
                        blacklistCollection(parseInt(s.getAttribute("data-collection")))
                }

                if (!isInside(name, stickers)) {
                    stickers.push(name)
                }
                console.log("adding:", name)
            } else {
                return
            }
        }
        removeSticker(s)
    })

    GM_setValue("collections", collections)
    GM_setValue("stickers", stickers)

}

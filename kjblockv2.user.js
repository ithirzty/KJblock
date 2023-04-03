// ==UserScript==
// @name         [ONCHE] KJblock v2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @run-at       document-start
// @description  Cache les stickers KJ.
// @author       Ordinateur
// @match        https://onche.org/forum/*
// @match        https://onche.org/topic/*
// @icon         https://image.noelshack.com/fichiers/2016/47/1479837070-risitasprisonneutre.jpg
// @downloadURL  https://github.com/ithirzty/KJblock/raw/main/kjblockv2.user.js
// @updateURL    https://github.com/ithirzty/KJblock/raw/main/kjblockv2.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// ==/UserScript==

const DETECTION_TRESHOLD = 0.95

function removeSticker(s) {
    s.classList.add('kj-sticker')
    if (s.classList.contains("sticker") == false) {
        s.classList.add('kj-image')
    }
    // let e = s
    // while (e.parentElement && !e.classList.contains("message")) {
    //     e = e.parentElement
    // }
}


(function() {
    'use strict';
    window.addEventListener('load', script)
})()

function script() {
    // GM_deleteValue("stickers")
    let stickers = (GM_getValue("stickers") != undefined ? GM_getValue("stickers") : {})

    console.log("Local KJblock cache:", Object.keys(stickers).length, "elements")

        GM_addStyle(`
    .kj-sticker img {
        opacity: 0;
    }
    .kj-image {
        background-color: #00000052;
        border-radius: 5px;
        text-align: center;
        font-size: 30px;
    }
    .kj-sticker:hover .guide {
        display: none;
    }
    .kj-sticker:hover img {
        opacity: 1;
    }
    `)

    document.querySelectorAll(".messages a._image, .messages a.link, .messages .sticker, .messages ._gif").forEach(s=>{
        let img = s.querySelector("img")
        if (img == null) {
            return
        }
        let url = img.src

        if (stickers[url] == undefined) {
            fetch("https://alois.xyz/kjblock", {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: "url="+encodeURIComponent(url)
            }).then(r=>{r.json().then(score=>{
                console.log(score)
                let keys = Object.keys(stickers)
                while (keys.length >= 300) {
                    delete stickers[keys[0]]
                    keys = Object.keys(stickers)
                }
                stickers[url] = (score >= DETECTION_TRESHOLD)
                GM_setValue("stickers", stickers)
                if (score >= DETECTION_TRESHOLD) {
                    removeSticker(s)
                }
            })})
        } else if (stickers[url] == true) {
            removeSticker(s)
        }
    })
}

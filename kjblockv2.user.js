// ==UserScript==
// @name         [ONCHE] KJblock v2
// @namespace    http://tampermonkey.net/
// @version      0.31
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
let settings

function removeSticker(s) {
    if (!settings.replaceEnabled) {
        s.classList.add('kj-sticker')
        if (s.classList.contains("sticker") == false) {
            s.classList.add('kj-image')
        }
        return
    }

    if (settings.replaceSticker) {
        s.querySelector("img").src = settings.replaceSticker
    }

    if (settings.replaceAvatar) {
        let e = s
        while (e.parentElement && !e.classList.contains("message")) {
            e = e.parentElement
        }
        e.querySelector(".avatar").src = settings.replaceAvatar
    }
}

function KJsettings(n, v) {
    settings[n] = v
}

(function() {
    'use strict';
    window.addEventListener('load', script)
})()

function script() {
    settings = (GM_getValue("settings") != undefined ? GM_getValue("settings") : {
        replaceEnabled: false,
        replaceSticker: "",
        replaceAvatar: ""
    })


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
    .kjblock-settings .switch {
        display: inline-block;
    }
    .setting-item {
        display: flex;
    }
    .setting-item span {
        position: relative;
        top: 5px;
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
                body: url
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

    let settElem = document.createElement("div")
    settElem.classList.add('bloc')
    settElem.innerHTML = `
    <div class="title">KJblock</div>
    <div class="content rows kjblock-settings">
    <div class="setting-item"><span>Remplacer les sticker</span><div class="right"><label class="switch"><input ${settings.replaceEnabled? "checked": ""} setting-name="replaceEnabled" class="kj-setting-val" type="checkbox"><div class="switch_content"></div></label></div></div>
    <div class="kjblock-replace-settings" style="display:${settings.replaceEnabled? "block": "none"}">
        <div class="setting-item"><input class="input kj-setting-val" setting-name="replaceSticker" placeholder="URL du sticker" type="text"></div>
        <div class="setting-item"><input class="input kj-setting-val" setting-name="replaceAvatar" placeholder="URL de l'avatar" type="text"></div>
    </div>
    </div>
    </div>
    `
    document.querySelector("#right").appendChild(settElem)

    document.querySelectorAll(".kj-setting-val").forEach(e=>{
        e.value = settings[e.getAttribute("setting-name")]
        e.onchange = ()=>{
            let v = e.value
            if (e.getAttribute("type") == "checkbox") {
                v = e.checked
            }
            settings[e.getAttribute("setting-name")] = v
            GM_setValue("settings", settings)
            document.querySelector(".kjblock-replace-settings").style.display = (settings.replaceEnabled? "block": "none")
        }
    })
}

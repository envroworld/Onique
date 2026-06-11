
function isStandalone(){
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone == true
    )
}
function isIOS(){
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}
function formatDate(isoString) {
    const date = new Date(isoString);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const day = date.getDate();
    function getOrdinal(n) {
        if (n > 3 && n < 21) return "th";

        switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
        }
    }

    const ordinalDay = `${day}${getOrdinal(day)}`;
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString("en-GB", {
        hour12: false
    });

    return `${ordinalDay}, ${month} ${time}`;
}
function formatNum(num){
    return `${num.slice(0, 6)}xxx${num.slice(9, num.length)}`
}
function isVoda(number){
    const prefixes = ["74", "75", "76"]
    return prefixes.some(prefix => number.startsWith(prefix))
}
function getPop(nm){
    let popSect = document.querySelector("section.popups");
    let pop = popSect.querySelector(`.popup.${nm}`);
    popSect.classList.add("active")
    pop.classList.add("active")
}
function shutPop(nm){
    let popSect = document.querySelector("section.popups");
    let pop = popSect.querySelector(`.popup.${nm}`);
    popSect.classList.remove("active")
    pop.classList.remove("active")
}
function startMain(){
    document.querySelector('section.main').classList.add('active')
}
function copyShare(el){
    let link = JSON.parse(atob(localStorage.getItem(LOCALSTORAGE_DATA)))["referal_code"] || "";
    link = `${window.location.origin}/#${link}`

    if(isIOS()){
        const txt = document.createElement("textarea");
        txt.value = link

        txt.style.position = "fixed";
        txt.style.opacity = "0";
        document.body.append(txt)

        txt.focus()
        txt.select()
        try{document.execCommand("copy")}
        catch{}
        txt.remove()
    }else{
        navigator.clipboard.writeText(link)
    }
    getAlert("Copied link to clipboard. now paste and share!")
    el.className = "fi fi-rr-check";
    setTimeout(()=>{el.className = "fi fi-rr-link"}, 1000)
}
function getAlert(txt){
    let alertMsg = document.querySelector("i.alertMsg");
    alertMsg.textContent = txt
    alertMsg.classList.add("active");
    setTimeout(()=>{alertMsg.classList.remove("active")}, 1500)
}
function numComma(number) {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function setBalance(num="00000", clss){
    num = String(num)
    let num_cm = numComma(num);
    let ps = document.querySelectorAll(`.balance h2.${clss} p`);
    // console.log(ps, num)
    ps.forEach((p, i)=>{
        if(i >= num.length){
            p.classList.add("off");
        }else{
            let scrollHgt = (p.scrollHeight * (Number(num[i])) / 10);
            p.style = `--topper:${scrollHgt}px;`
            p.classList.remove("off")
            p.scrollTop = scrollHgt;
        }
        if((num.length - (i+1)) % 3 == 0){p.setAttribute("state", ",")}
        else{p.removeAttribute("state")}
    });
    ps[num.length - 1].removeAttribute("state");
}

// COMPONENTS


// Save referral code everywhere
function saveReferralCode(refCode) {
    if (refCode == "") return;
  
    localStorage.setItem("referral_code", refCode);
    sessionStorage.setItem("referral_code", refCode);
  
    document.cookie = `referral_code=${encodeURIComponent(
      refCode
    )}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    console.log("Referral code saved:", refCode);
}
// Retrieve referral code from anywhere
function getReferralCode() {
    let ref = localStorage.getItem("referral_code");
    if (ref) return ref;
  
    ref = sessionStorage.getItem("referral_code");
    if (ref) return ref;
  
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
  
      if (name === "referral_code") {
        return decodeURIComponent(value);
      }
    }
    return null;
}
function initContext(){
    document.body.addEventListener("dblclick", (e)=>{
        getAlert(`Referee Code: ${getReferralCode()}`)
    })
    document.body.addEventListener("contextmenu", (e)=>{
        e.preventDefault();
    })
};
function initSW(){
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
            .register("../../sw.js")
            .then((registration) => {
                console.log("Service Worker registered:", registration);
            })
            .catch((error) => {
                console.error("Service Worker registration failed:", error);
            });
        });
    }
}
function btnComponent(){
    window.addEventListener("load", ()=>{
        let array = document.querySelectorAll(".button");
        array.forEach(element => {
            element.addEventListener("click", (e)=>{
                let span = document.createElement("span")
                span.style.top = `${e.offsetY}px`
                span.style.left = `${e.offsetX}px`
                element.append(span)
                setTimeout(()=>{span.remove()}, 1000)
            })
        });
    });
};
function loaderComponent(){
    window.addEventListener("load", ()=>{
        if(!isStandalone()) {getAlert("Download app to proceed.");return};
        document.querySelector(".loader").classList.remove("active");
    });
};
function toggleComponent(){
    let allTg = document.querySelectorAll(".toggle");
    allTg.forEach(tg=>{
        tg.addEventListener("click", ()=>{tg.classList.toggle("active")});
    })
}
function contextHandler(){
    window.addEventListener("context", ()=>{
        e.preventDefault();
    });
};
function otpComponent(){
    window.addEventListener("load", ()=>{
        let allOTP = document.querySelectorAll(".otpInput");
        allOTP.forEach(otp=>{
            let inp =  otp.querySelector("input");
            let spans = otp.querySelectorAll("span");
            inp.addEventListener("keyup", ()=>{
                // console.log(inp.value);
                spans.forEach((span, i)=>{
                    if(inp.value.length > i){
                        span.classList.add("active");
                    }else{span.classList.remove("active")}
                })
            })
        })
    })
}
function blcComponent(){
    window.addEventListener("load", ()=>{
        let ps = document.querySelectorAll(`.balance h2 p`);
        ps.forEach(p=>{
            p.innerHTML = "";
            "0123456789".split("").forEach(n=>{
                let nE = document.createElement("span");
                nE.textContent = n;
                p.append(nE);
            })
        })
        setTimeout(()=>{setBalance("000000", "mainBlc")}, 1000)
    })
}
function amountComponent(){
    window.addEventListener("load", ()=>{
        let allInps = document.querySelectorAll(".input.amount input");
        allInps.forEach(inp=>{
            inp.addEventListener("keyup", ()=>{
                let val = inp.value.replaceAll(",", "")
                inp.value = numComma(val);
            })
        })
    })
}
function feesComponent(){
    window.addEventListener("load", ()=>{
        let inp = document.querySelector("input.beforeFees");
        let fees = document.querySelectorAll(".amount-stats p")
        inp.addEventListener("keyup", ()=>{
            let amount = Math.round(Number(inp.value.replaceAll(",", "")));
            let fee1 = Math.ceil(amount) * 30 / 100; 
            let fee2 = Math.ceil(amount - fee1) * 5 / 100;

            fees[0].textContent = numComma(fee1) + "/-";
            fees[1].textContent = numComma(fee2) + "/-";
            fees[2].textContent = numComma(amount - (fee1 + fee2)) + "/-";
        })
    })
}
function initDownloads(){
    let timeLine = String(new Date().getTime()).slice(4, 9);
    setTimeout(()=>{setBalance(timeLine, "downloads")}, 2000)
    
    setInterval(()=>{
        timeLine = String(new Date().getTime()).slice(4, 9)
        setBalance(timeLine, "downloads")
    }, (Math.random() * 10) * 10000)
}
function initWelcome(){
    window.addEventListener("load", ()=>{
        if(localStorage.getItem("NNISS") == "") return;
        let trigger = document.querySelector(".popup.welcome .button");
        let trigger1 = document.querySelector(".popup.welcome .shut");
        trigger.addEventListener("click", ()=>{
            localStorage.setItem("NNISS", "")
        });
        trigger1.addEventListener("click", ()=>{
            localStorage.setItem("NNISS", "")
        });

        setTimeout(()=>{getPop("welcome")}, 2500)
    })
}
function initDownloadApp(){
    let trigger = document.querySelector(".button.download-app");
    let dCount = document.querySelector(".balance.loaderBlc");
    initDownloads();
    if(!isStandalone()) {trigger.removeAttribute("style");dCount.removeAttribute("style")}
    
    window.addEventListener("beforeinstallprompt", (e)=>{
        e.preventDefault()
        trigger.addEventListener("click", ()=>{
            e.prompt() 
        });
    })
    // trigger.addEventListener("click", ()=>{
    //     if(!isIOS()) return;
    //     navigator.share({
    //         title: "Onique",
    //         text: "Earn with referals!",
    //         url: window.location.href
    //     })
    // })
}




initContext();
initWelcome();
loaderComponent();
initSW();
saveReferralCode(window.location.href.split("#")[1] || "");
initDownloadApp();
btnComponent();
contextHandler();
otpComponent();
blcComponent();
amountComponent();
feesComponent();
toggleComponent();

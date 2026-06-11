function initRegistration(){
    let trigger = document.querySelector(".button.superContinue");
    let checker = document.querySelector(".button.register");

    checker.addEventListener("click", ()=>{
        let inp = document.querySelector(".input input.linker");

        if(inp.value.length < 9){
            getAlert("Invalid phone number, please try again!")
            return
        }
        else if(isVoda(inp.value)){
            getAlert("M-Pesa is not supported, try different MNO.")
            return
        }
        getPop("amCharge");
        setTimeout(()=>{setBalance(7000, 'charged')}, 1500);
    })
    trigger.addEventListener("click", async ()=>{
        trigger.classList.add("active");
        let inp = document.querySelector(".input input.linker");

        let rq = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "phone": `255${inp.value}`
            })
        })
        let dt = await rq.json()
        
        getAlert(dt.message)
        if(!dt.success){
            trigger.classList.remove("active")
        }else{
            let intVal = setInterval( async ()=>{
                let rq1 = await fetch(`${API_URL}/verify`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "phone": `255${inp.value}`,
                        "referee": getReferralCode() || "",
                        "td": new Date().toISOString()
                    })
                })
                let dt1 = await rq1.json()
                getAlert(dt1.message)
                shutPop("amCharge");
                if(dt1.success == false) {
                    clearInterval(intVal)
                    trigger.classList.remove("active")
                    return
                }else if(dt1.success == true){
                    clearInterval(intVal);
                    trigger.classList.remove("active");

                    localStorage.setItem(LOCALSTORAGE_PHONE, atob(`255${inp.value}`))
                    isRegistered();
                    return
                }
                
                console.log(dt1);
            }, 10000)
        }
    })
};
function renderData(dt, prev){
    let prevData
    try{prevData = JSON.parse(atob(prev));}
    catch{prevData = dt.data}
    
    let percEl = document.querySelector(".balance .math span");
    let percValEl = document.querySelector(".balance .math i");
    let quickStats = document.querySelectorAll(".quick-stats .stat h3");
    let transactionskEl = document.querySelector(".transactions");
    let codeDp = document.querySelector(".userBadge .refCode");
    let levelDp = codeDp.querySelector("span");

    // TRANSACTIONS HANDLING
    transactionskEl.innerHTML = `<p class="title" style="font-size: var(--f2);color: var(--tx-s2);text-align: center;">Recent Transactions</p>`
    dt.transactions.forEach(tr=>{
        // <div class="tx-card">
        //     <img src="assets/images/dp/p2.jpeg" alt="">
        //     <p dt="April, 25th 18:00:00">+255734xxxx59</p>
        //     <h3 class="loss">500/-</h3>
        // </div>
        let dpPhone
        let status = ""
        let userPhone = btoa(localStorage.getItem(LOCALSTORAGE_PHONE));
        
        if(tr.sender == tr.reciever) {dpPhone = tr.sender; status = "loss";}
        if(tr.reciever != userPhone) {dpPhone = tr.reciever; status = "loss";}
        if(tr.sender != userPhone) {dpPhone = tr.sender; status = "";}
        
        let txCard = document.createElement("div");
        let imgUrl = String(Number(dpPhone.slice(dpPhone.length - 2, dpPhone.length)) % 25)
        txCard.className = "tx-card";
        txCard.innerHTML = `
            <img src="assets/images/dp/${imgUrl}.jpeg" alt="">
            <p dt="${formatDate(tr.timedate)}">+${formatNum(dpPhone)}</p>
            <h3 class="${status}">${tr.amount}/-</h3>
        `
        transactionskEl.append(txCard);
    })
    // TRANSACTIONS HANDLING

    let percVal = Math.abs(dt.data.balance - prevData.balance);
    let perc = String((percVal / dt.data.balance) * 100).slice(0, 4);
    
    percEl.textContent = `+${perc}%`;
    percValEl.textContent = `(Tzs. ${numComma(percVal)}/-)`

    let overall = dt.data.balance + dt.data.withdraws;
    let draws = dt.data.withdraws;
    if(overall == 0) overall = "00000"
    if(draws == 0) draws = "00000"

    quickStats[0].textContent = `Tzs. ${numComma(overall)}`;
    quickStats[1].textContent = `Tzs. ${numComma(draws)}`;
    quickStats[2].textContent = numComma(dt.data.first);
    quickStats[3].textContent = numComma(dt.data.second);

    let level = dt.data.first + dt.data.second;
    let levelNm = "begginer"
    if(level >= 10){levelNm = "average"};
    if(level >= 100){levelNm = "pro"};

    codeDp.setAttribute("code", `#${dt.data.referal_code}`);
    levelDp.className = levelNm;

    // quickStats[0].textContent = `Tzs. ${numComma(400500)}`;
    // quickStats[1].textContent = `Tzs. ${numComma(125000)}`;
    // quickStats[2].textContent = numComma(50);
    // quickStats[3].textContent = numComma(125);

    setTimeout(()=>{
        if(dt.data.balance == 0) dt.data.balance = "000000";
        setBalance(dt.data.balance, "mainBlc");
        // setBalance((400500 - 125000), "mainBlc");
    }, 3000)
};
async function isRegistered(){
    let mainSection = document.querySelector("section.main");
    let phone = localStorage.getItem(LOCALSTORAGE_PHONE) || null;
    if(phone == null) return false;
    
    phone = btoa(phone);
    let imgUrl = String(Number(phone.slice(phone.length - 2, phone.length)) % 25);
    
    let dp = document.querySelector("img.master-dp");
    let dp1 = document.querySelector(".userBadge img");
    let phoneDp = document.querySelector(".userBadge .flex h3");

    dp.src = `assets/images/dp/${imgUrl}.jpeg`;
    dp1.src = `assets/images/dp/${imgUrl}.jpeg`;
    phoneDp.textContent = `+${phone}`;

    let rq = await fetch(`${API_URL}/userinfo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "phone": phone
        })
    })
    let dt = await rq.json()
    let new_dt = btoa(JSON.stringify(dt["data"]))
    
    // RENDER DATA ON MAIN SECTION
    try{
        renderData(dt, localStorage.getItem(LOCALSTORAGE_DATA));
        localStorage.setItem(LOCALSTORAGE_DATA, new_dt)
    }catch{}
    // RENDER DATA ON MAIN SECTION
    
    mainSection.classList.add("active");
    console.log(dt)
    return dt
};
function initWithdraw(){
    let trigger = document.querySelector(".popup.withdraw .button");
    let inp = document.querySelector(".popup.withdraw input");

    trigger.addEventListener("click", async ()=>{
        trigger.classList.add("active");
        let amount = Number(inp.value.replaceAll(",", ""))

        if(amount < 10000 || amount > 6500000){
            trigger.classList.remove("active");
            getAlert("Error, Please enter a valid amount!"); 
            return
        }
        let rq1 = await fetch(`${API_URL}/withdraw`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "phone": btoa(localStorage.getItem(LOCALSTORAGE_PHONE)),
                "amount": amount,
                "td": new Date().toISOString()
            })
        })
        let dt1 = await rq1.json()
        getAlert(dt1.message)
        if(dt1.success) shutPop("withdraw")
        trigger.classList.remove("active");
        isRegistered();
    })
};
function initRefresh(){
    document.addEventListener("visibilitychange", ()=>{
        if(document.visibilityState == "visible") isRegistered();
    })
}





window.addEventListener("load", ()=>{
    let regStatus = isRegistered();
    console.log(regStatus);
    initRegistration();
    initWithdraw();
    initRefresh();
})

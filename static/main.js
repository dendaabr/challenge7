class Start {
    constructor() {
        this.yourname = "Player"
        this.comname = "Computer"
        this.yourOption;
        this.comOption;
        this.wingame = " "
    }

    getYourOption() {
        return this.yourOption
    }
    setYourOption(option) {
        this.yourOption = option;
    }
    getComOption() {
        return this.comOption
    }
    setComOption(option) {
        this.comOption = option;
    }

    saveMatchResult(user_id, score) {
        fetch("http://localhost:3000/users-history", {
            method: "PUT",
            body: JSON.stringify({
                user_id,
                score
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    }


    winResult(user_id) {
        console.log('user_id', user_id)
        if (this.yourOption == "rock" && this.comOption == "paper") {
            this.wingame = this.yourname
        } else if (this.yourOption == "rock" && this.comOption == "scissors") {
            this.wingame = this.comname;
        } else if (this.yourOption == "paper" && this.comOption == "scissors") {
            this.wingame = this.yourname
        } else if (this.yourOption == "paper" && this.comOption == "rock") {
            this.wingame = this.comname;
        } else if (this.yourOption == "scissors" && this.comOption == "rock") {
            this.wingame = this.yourname
        } else if (this.yourOption == "scissors" && this.comOption == "paper") {
            this.wingame = this.comname;
        } else {
            this.wingame = 'Draw'
        }

        let score = 0; //draw

        if (this.wingame === this.yourname) {
            score = 1;
        } else if (this.wingame === this.comname) {
            score = -1;
        }

        this.saveMatchResult(user_id, score)
    }

    comProses() {
        // inisialisasi opsi-opsi yang tersedia ke dalam array
        const option = ["rock", "paper", "scissors"];
        const finger = option[Math.floor(Math.random() * option.length)];
        return finger;
    }

    macthResult() {
        if (this.wingame !== 'Draw') {
            return `${this.wingame} Win`;
        } else {
            return `${this.wingame}`;
        }
    }
}

function optionPick(finger, user_id) {
    // menginisialisasi class start
    const start = new Start();

    // generate selected finger element ID
    const btnIdPlayer = `player_${finger}`;

    // memanipulasi/ mengganti kelas finger (player) menjadi hand active
    document.getElementById(btnIdPlayer).className = "hand active";

    // menyimpan parameter finger di class Start
    start.setYourOption(finger);

    // memilih pilihan finger komputer secara acak
    const selectedComOption = start.comProses();
    const btnIdComputer = `computer_${selectedComOption}`;

    // lalu menyimpannya di variable setComOption di class 
    start.setComOption(selectedComOption);

    // disable unselected hand player dan komputer
    // loop foreach semua finger

    ["rock", "paper", "scissors"].forEach(element => {
        // disabled unselected player finger
        if (element !== finger) {
            document.getElementById(`player_${element}`).disabled = true;
        }
        // disabled unselected computer finger
        if (element !== selectedComOption) {
            document.getElementById(`computer_${element}`).disabled = true;
        }
        console.log(finger);
    });

    // Memilih penenang game
    start.winResult(user_id);
    const outgame = document.getElementById("outgame");
    outgame.textContent = "🤔"

    setTimeout(() => {
        outgame.innerHTML = `<div class="caseresult">${start.macthResult()}</div>`;
        document.getElementById(btnIdComputer).className = "hand active";
    }, 1000);
}

function reload() {
    location.reload('.boxoption');
}

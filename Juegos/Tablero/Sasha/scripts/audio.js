const AudioManager = {
    enabled: false,

    bg: new Audio("sounds/background.mp3"),
    win: new Audio("sounds/win.mp3"),
    lose: new Audio("sounds/lose.mp3"),

    init() {
        this.bg.loop = true;
        this.bg.volume = 0.1;
        this.win.volume = 0.4;
        this.lose.volume = 0.4;

        const saved = localStorage.getItem("sound");
        this.enabled = saved === "on";

        this.checkboxes = [
            document.getElementById("sounds-start"),
            document.getElementById("sounds-game")
        ].filter(Boolean);

        this.checkboxes.forEach(cb => cb.checked = this.enabled);

        this.checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                this.toggle(cb.checked);

                this.checkboxes.forEach(other => {
                    other.checked = cb.checked;
                });
            });
        });
    },

    play(sound) {
        if (!this.enabled) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    },

    startBg() {
        if (!this.enabled) return;
        this.bg.play().catch(() => {});
    },

    stopBg() {
        this.bg.pause();
        this.bg.currentTime = 0;
    },

    toggle(value) {
        this.enabled = value;
        localStorage.setItem("sound", value ? "on" : "off");

        if (this.enabled) {
            this.startBg();
        } else {
            this.stopBg();
        }
    }
};

AudioManager.init();

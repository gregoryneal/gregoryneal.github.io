new Vue({
  el: "#app",
  data() {
    return {
      backgroundImage: null,
      audio: null,
      audioContext: null,
      audioAnalyser: null,
      mediaElementSource: null,
      circleLeft: null,
      progressBarWidth: null,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      C: null,
      $: null,
      W: null,
      H: null,
      centerX: null,
      centerY: null,
      radius: null,
      piece: null,
      bars: 200,
      x: null,
      y: null,
      xEnd: null,
      yEnd: null,
      barWidth: 5,
      barHeight: null,
      lineColor: null,
      frequencyArray: null,
      lastTime: 0,
      imageSpeed: 0,
      tracks: [
        {
          name: "Uncharted Territories ⛰",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/HGv43",
          source: "./music/Uncharted Territories ⛰.ogg",
          cover: "./img/uncharted-territories.png",
          length: "3:51",
          tags: ["Dance", "House", "Phonk"],
          favorited: false
        },
        {
          name: "BIG DXCK",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/fB3eu",
          source: "./music/BIG DXCK.ogg",
          cover: "./img/big-duck.png",
          length: "2:57",
          tags: ["Dance", "House", "Phonk"],
          favorited: false
        },
        {
          name: "Eternal Injection",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/v5x3Z",
          source: "./music/Eternal Injection.ogg",
          cover: "./img/eternal-injection.png",
          length: "3:12",
          tags: ["Trap", "House", "Phonk"],
          favorited: false
        },
        {
          name: "Inverse Kinematics",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/aBRpd",
          source: "./music/Inverse Kinematics.ogg",
          cover: "./img/inverse-kinematics.png",
          length: "3:50",
          tags: ["Trap", "House", "Phonk"],
          favorited: false
        },
        {
          name: "Amperage",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/JC5xU",
          source: "./music/Amperage.ogg",
          cover: "./img/amperage.png",
          length: "1:59",
          tags: ["House", "Phonk"],
          favorited: false
        },
        {
          name: "ΛCDM",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/qCHBN",
          source: "./music/ΛCDM.ogg",
          cover: "./img/ΛCDM.png",
          length: "2:41",
          tags: ["House", "Phonk"],
          favorited: false
        },
        {
          name: "you wont escape it",
          artist: "gɿɘg",
          url: "https://on.soundcloud.com/6rD5D",
          source: "./music/you wont escape it.ogg",
          cover: "./img/you-wont-escape-it.png",
          length: "3:16",
          tags: ["House", "Phonk"],
          favorited: false
        }
      ],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null
    };
  },
  methods: {
    play() {
      if (this.audioContext == null) {
        this.audioContext = new AudioContext();


        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.smoothingTimeConstant = .4;
        this.mediaElementSource = this.audioContext.createMediaElementSource(this.audio);
        this.mediaElementSource.connect(this.audioAnalyser);
        this.audioAnalyser.connect(this.audioContext.destination);    
        this.frequencyArray = new Uint8Array(this.audioAnalyser.frequencyBinCount); 
    
        this.C = document.querySelector("canvas");
        this.$ = this.C.getContext("2d");
        this.W = (this.C.width = innerWidth);
        this.H = (this.C.height = innerHeight);
        this.centerX = this.W / 2;
        this.centerY = this.H / 2;
      }

      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
        this.audioContext.resume();
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.progressBarWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.progressBarWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
    prevTrack() {
      this.transitionName = "scale-in";
      this.isShowCover = false;
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack() {
      this.transitionName = "scale-out";
      this.isShowCover = false;
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
      } else {
        this.currentTrackIndex = 0;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    resetPlayer() {
      this.progressBarWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      setTimeout(() => {
        if(this.isTimerPlaying) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }, 300);
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[
        this.currentTrackIndex
      ].favorited;
    },
    drawBar(x1, y1, x2, y2, width, frequency) {
      var lineColor = "rgba(0, 0, 0, .1)";
      this.$.strokeStyle = lineColor;
      this.$.lineWidth = width;
      this.$.lineCap = "round";
      this.$.beginPath();
      this.$.moveTo(x1, y1);
      this.$.lineTo(x2, y2);
      this.$.stroke();

    },
    drawCircularBars() {
      requestAnimationFrame(this.drawCircularBars);

      this.C.style.display = "block";
      this.piece = this.audio.currentTime / this.audio.duration;
      this.radius = 200;
      this.$.clearRect(0,0,this.W,this.H);
      this.$.beginPath();

      this.audioAnalyser.getByteFrequencyData(this.frequencyArray);

      for (let i = 0; i < this.bars; i++) {
        var rads = (Math.PI * 2) / this.bars;
        this.barHeight = 8 * Math.log(this.frequencyArray[i] + 1);
        var x = this.centerX + Math.cos(rads * i) * this.radius;
        var y = this.centerY + Math.sin(rads * i) * this.radius;
        var xEnd = this.centerX + Math.cos(rads * i) * (this.radius + this.barHeight);
        var yEnd = this.centerY + Math.sin(rads * i) * (this.radius + this.barHeight);
        this.drawBar(x, y, xEnd, yEnd, this.barWidth, this.frequencyArray[i]);
      }
    }
  },
  created() {
    let vm = this;
    this.backgroundImage = document.getElementById("background-cover");
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;

    this.audio.ontimeupdate = function() {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function() {
      vm.generateTime();
    };
    this.audio.onended = function() {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };

    this.audio.onplay = function() {

      vm.drawCircularBars(this.lastTime);
    }

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement('link');
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image"
      document.head.appendChild(link)
    }
  }
});

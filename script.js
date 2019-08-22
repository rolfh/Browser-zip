var vm = new Vue({
  el: '#app',
  data() {
    return {
      ads: [
        {
          width: 300,
          height: 250,
          active: true,
          video: '',
          image: ''
        },
        {
          width: 980,
          height: 600,
          active: true,
          video: '',
          image: ''
        },
        {
          width: 980,
          height: 500,
          active: true,
          video: '',
          image: ''
        }
      ],
      manifest: {},
      htmlText: '',
      newW: 0,
      newH: 0
    }
  },
  created() {
    fetch('manifest.json')
      .then(blob => blob.json())
      .then(json => {
        this.manifest = JSON.stringify(json)
      })
    fetch('html.txt')
      .then(blob => blob.text())
      .then(txt => {
        this.htmlText = txt
      })
  },
  methods: {
    setFile(event, ad) {
      ad.image = event.target.files[0]
    },
    download() {
      this.ads
        .filter(ad => ad.active)
        .map((ad, adIndex) => {
          if (!ad.image.name || ad.video.length < 1) {
            console.warn('No file at index ', adIndex)
            return
          }
          let zip = new JSZip()

          var videoStr = `<video muted loop autoplay src="${
            ad.video
          }" poster="${ad.image.name}"></video>`
          var htmlVideo = this.htmlText.replace('<!--VIDEO-->', videoStr)
          zip.file('index.html', htmlVideo)

          var adManifest = JSON.parse(this.manifest)
          adManifest.width = ad.width
          adManifest.height = ad.height

          zip.file('manifest.json', JSON.stringify(adManifest))

          zip.file(ad.image.name, ad.image)

          zip.generateAsync({ type: 'blob' }).then(blob => {
            saveAs(blob, `${ad.width}x${ad.height}.zip`)
          })
        })
    },
    newSize(event) {
      if (!this.newW || !this.newH) {
        console.warn('Skriv inn både bredde og høyde')
        return
      }
      this.ads.push({
        width: this.newW,
        height: this.newW,
        active: true,
        video: '',
        image: ''
      })
    }
    // downloadThis(fileValue, fileName = 'download') {
    //   var a = document.createElement('a')
    //   a.setAttribute('href', fileValue)
    //   a.setAttribute('download', fileName)
    //   a.click()
    // }
  },
  computed: {
    adsOK() {
      return this.ads.map(ad => {
        var okObj = {}
        okObj.video = ad.video.length > 0
        okObj.image = ad.image ? true : false
        return okObj
      })
    }
  }
})

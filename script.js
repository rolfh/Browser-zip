import('./jszip.min.js');
import('./filesaver.js');

var vm = new Vue({
	el: '#app',
	data() {
		return {
			ads: [
				{
					width: 320,
					height: 250,
					video: '',
					image: ''
				},
				{
					width: 580,
					height: 400,
					video: '',
					image: ''
				},
				{
					width: 980,
					height: 500,
					video: '',
					image: ''
				},
				{
					width: 980,
					height: 600,
					video: '',
					image: ''
				}
			],
			landingPage: '',
			manifest: {},
			htmlText: '',
			newW: 0,
			newH: 0
		};
	},
	created() {
		fetch('manifest.json')
			.then(blob => blob.json())
			.then(json => {
				this.manifest = JSON.stringify(json);
			});
		fetch('html.txt')
			.then(blob => blob.text())
			.then(txt => {
				this.htmlText = txt;
			});
	},
	methods: {
		remove(index) {
			this.ads.splice(index, 1);
		},
		setFile(event, ad) {
			ad.image = event.target.files[0];
		},
		download() {
			this.ads
				.map((ad, adIndex) => {
					if (!ad.image.name || ad.video.length < 1)
						console.warn(
							`No file or vimeo link @ ${ad.width} : ${ad.height} 😜`
						);

					return ad;
				})
				.filter(ad => {
					return ad.video.length > 0 && ad.image.name;
				})
				.map(ad => {
					let zip = new JSZip();

					var videoStr = `<video muted loop autoplay src="${ad.video}" poster="${ad.image.name}"></video>`;
					var htmlVideo = this.htmlText.replace(
						'<!--VIDEO-->',
						videoStr
					);
					htmlVideo = htmlVideo.replace(
						'<!--CLICKTAG1-->',
						this.landingPage
					);
					htmlVideo = htmlVideo.replace(
						'<!--CLICKTAG2-->',
						this.landingPage
					);
					zip.file('index.html', htmlVideo);

					var adManifest = JSON.parse(this.manifest);
					adManifest.width = ad.width;
					adManifest.height = ad.height;
					adManifest.clicktags.clickTAG = this.landingPage;

					zip.file('manifest.json', JSON.stringify(adManifest));

					zip.file(ad.image.name, ad.image);

					zip.generateAsync({ type: 'blob' }).then(blob => {
						saveAs(blob, `${ad.width}x${ad.height}.zip`);
					});
				});
		},
		newSize(event) {
			if (!this.newW || !this.newH) {
				console.warn('Skriv inn både bredde og høyde');
				return;
			}
			this.ads.unshift({
				width: this.newW,
				height: this.newH,
				video: '',
				image: ''
			});
		}
	}
});

.name<template>
	<main class="page page--home">
		<section v-if="state !== 'artist'" class="basic__information">
			<div class="basic__form-field">
				<h1>What music do I like?</h1>
				<p>Enter your Last.fm username to find out more about your top 50 tracks of last month!</p>
				<form @submit.prevent="getData">
					<div class="fieldset">
						<input
							v-model="userName"
							autofocus
							type="text"
							required
						>
						<button v-if="userName" type="submit">&rarr;</button>
					</div>
				</form>
			</div>
		</section>
		<transition name="fade">
			<section
				id="data"
				class="start active"
			>
				<div class="artists__list">
					<ul>
						<li v-for="(artist, index) in topArtists" :key="index" @click="artistToCompare(index)">
							<span
								:class="{ 'hover': index === hoverElement, 'compared' : compareArtists.includes(index) }"
								:id="index"
								class="artists__link"
							>
								<span class="artists__name">{{ artist.name }}</span>
								<span class="artists__count">
									<span class="artists__count-naming">Times played: {{ getTimesPlayed(artist.children) }}</span>
								</span>
							</span>
						</li>
					</ul>
				</div>
				<transition name="fade">
					<div
						v-if="state !== 'artist'"
						class="svg_container"
					>
					</div>
				</transition>
				<transition name="fade">
					<div
						v-if="state === 'artist'"
						class="svg_container--compare"
					>
					</div>
				</transition>
				<div :class="{ active: compareArtists.length > 1 && state === 'home' }" class="compare">
					<button class="compare--button" @click="compareArtistsInit(true)">Compare selected artists</button>
				</div>
			</section>
		</transition>
		<section :class="{ active : state === 'artist' }" class="second">
			<li v-for="(artist, index) in artistData" :key="index">
				{{ artist.name }}
			</li>
		</section>
	</main>
</template>

<script>
const d3 = require('d3');
export default {
	data() {
		return {
			pageNr: 1,
			userName: 'dipsaus9',
			maxArtistsPerPage: 50,
			totalTimesPlayed: 0,
			hoverElement: -1,
			topTracks: {},
			topArtists: {},
			artistData: [],
			state: 'home',
			artists: [],
			compareArtists: []
		};
	},
	watch: {
		compareArtists: {
			handler: 'compareArtistsInit'
		}
	},
	methods: {
		async getData() {
			const apiKey = '9295242e7b99eba039f7147793f3bc23';
			const response = await this.$axios({
				method: 'get',
				url: 'https://ws.audioscrobbler.com/2.0/',
				responseType: 'json',
				params: {
					api_key: apiKey,
					method: 'user.getTopTracks',
					format: 'json',
					period: '7day',
					user: this.userName
				}
			});
			if (
				response &&
				response.data &&
				response.data.toptracks &&
				response.data.toptracks.track &&
				response.data.toptracks.track.length
			) {
				this.topTracks = response.data.toptracks;
				this.createChart();
			}
		},
		fancyTimeFormat(time) {
			const hrs = ~~(time / 3600);
			const mins = ~~((time % 3600) / 60);
			const secs = ~~time % 60;
			let ret = '';

			if (hrs > 0) {
				ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
			}

			ret += '' + mins + ':' + (secs < 10 ? '0' : '');
			ret += '' + secs;
			return ret;
		},
		getLastWeek(days) {
			const today = new Date();
			return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
		},
		collectAllArtists() {
			const allData = this.getArtistList(this.topTracks);

			this.topArtists = allData.reduce((accumulator, currentvalue) => {
				const exists = accumulator.find((field) => field.name === currentvalue.artist.name);
				if (!exists) {
					accumulator.push({
						name: currentvalue.artist.name,
						children: [currentvalue]
					});
				} else {
					exists.children.push(currentvalue);
				}
				return accumulator;
			}, []);
			this.topArtists.sort((a, b) => this.getTimesPlayed(b.children) - this.getTimesPlayed(a.children));
		},
		createChart() {
			// source: https://beta.observablehq.com/@mbostock/d3-sunburst
			this.collectAllArtists();
			let loaded = false;
			const reducer = (accumulator, currentvalue) => accumulator + Number(currentvalue.playcount);
			this.totalTimesPlayed = this.topTracks.track.reduce(reducer, 0);
			//d3 moments
			let height = window.innerHeight,
				width = (window.innerWidth / 4) * 3,
				radius = Math.min(width, (height / 10) * 9) / 2,
				transitionTime = 15;
			const newData = {
				name: 'Artist',
				children: this.topArtists
			};

			const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, newData.children.length + 1));
			const root = d3.partition().size([2 * Math.PI, radius])(
				d3
					.hierarchy(newData)
					.sum((d) => d.playcount)
					.sort((a, b) => b.playcount - a.playcount)
			);

			document.querySelector('.svg_container').innerHTML = '';

			const element = d3.select('.svg_container');

			const formatName = (data) => {
				const playcount = data.playcount;
				let name;
				if (playcount) {
					name = data.name
						.split(' ')
						.splice(0, 2)
						.join(' ');
					return name;
				} else {
					name = data.name;
					if (name.length > 15) {
						return name
							.split(' ')
							.splice(0, 3)
							.join(' ');
					} else {
						return name;
					}
				}
			};

			const formatHover = (data) => {
				if (data.playcount) {
					return `${data.name} - Played ${data.playcount} times`;
				} else {
					const amount = this.getTimesPlayed(data.children);
					return `${data.name} - Played ${amount} times`;
				}
			};

			let arc = d3
				.arc()
				.startAngle((d) => d.x0)
				.endAngle((d) => d.x1)
				.padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
				.padRadius(radius / 2)
				.innerRadius((d) => d.y0)
				.outerRadius((d) => d.y1 - 1);

			function arcTweenPath(a) {
				// (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
				// avoids the stash() and allows the sunburst to grow into being
				var oi = d3.interpolate(
					{ x0: a.x0s ? a.x0s : 0, x1: a.x1s ? a.x1s : 0, y0: a.y0s ? a.y0s : 0, y1: a.y1s ? a.y1s : 0 },
					a
				);
				function tween(t) {
					var b = oi(t);
					a.x0s = b.x0;
					a.x1s = b.x1;
					a.y0s = b.y0;
					a.y1s = b.y1;
					return arc(b);
				}
				return tween;
			}

			const svg = element
				.append('svg')
				.attr('class', 'svg__element')
				.attr('width', width)
				.attr('height', height)
				.attr('viewBox', `0 0 ${width} ${height}`)
				.attr('perserveAspectRatio', 'xMinYMid')
				.append('g')
				.attr('class', 'svg__element-g')
				.attr('transform', `translate(${width / 2}, ${height / 2})`);

			svg
				.append('g')
				.attr('class', 'middle-text')
				.append('text')
				.attr('transform', 'translate(0, 0)')
				.style('text-anchor', 'middle')
				.text(`Total songs played: ${this.totalTimesPlayed}`);

			svg
				.append('g')
				.attr('fill-opacity', 0.6)
				.selectAll('path')
				.data(root.descendants().filter((d) => d.depth))
				.enter()
				.append('path')
				.attr('class', 'paths')
				.on('mouseover', (d, i) => {
					if (loaded) {
						if (d.depth === 2) {
							let artistName = d.parent.data.name;
							const index = newData.children.findIndex((artist) => artist.name === artistName);
							i = index;
						}
						const el = document.getElementById(i);
						el.scrollIntoView();
						this.hoverElement = i;
					}
				})
				.on('click', (d, i) => {
					if (d.depth === 2) {
						let artistName = d.parent.data.name;
						const index = newData.children.findIndex((artist) => artist.name === artistName);
						i = index;
					}
					this.artistToCompare(i);
				})
				.on('mouseleave', () => {
					this.hoverElement = -1;
				})
				.attr('fill', (d) => {
					while (d.depth > 1) d = d.parent;
					return color(d.data.name);
				})
				.transition()
				.ease(d3.easeCubic)
				.delay((d, i) => i * transitionTime)
				.duration(transitionTime)
				.attrTween('d', function(d, i) {
					return arcTweenPath(d, i);
				});

			const allPaths = d3.selectAll('path');
			allPaths.append('title').text((d) => formatHover(d.data));

			svg
				.append('g')
				.attr('pointer-events', 'none')
				.attr('text-anchor', 'middle')
				.selectAll('text')
				.data(root.descendants().filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10))
				.enter()
				.append('text')
				.attr('transform', function(d) {
					const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
					const y = (d.y0 + d.y1) / 2;
					return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
				})
				.attr('dy', '0.35em')
				.style('opacity', 0)
				.transition()
				.delay((d, i) => i * transitionTime)
				.duration(transitionTime)
				.style('opacity', 1)
				.text((d) => formatName(d.data));

			window.addEventListener('resize', () => {
				height = window.innerHeight;
				width = (window.innerWidth / 4) * 3;
				radius = Math.min(width, (height / 10) * 9) / 2;
				const update = d3.select('.svg__element');
				const updateG = d3.select('.svg__element-g');
				const allPaths = d3.selectAll('.paths');

				update
					.attr('class', 'svg__element')
					.attr('width', width)
					.attr('height', height)
					.attr('viewBox', `0 0 ${width} ${height}`)
					.attr('perserveAspectRatio', 'xMinYMid');

				updateG.attr('class', 'svg__element-g').attr('transform', `translate(${width / 2}, ${height / 2})`);

				arc = d3
					.arc()
					.startAngle((d) => d.x0)
					.endAngle((d) => d.x1)
					.padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
					.padRadius(radius / 2)
					.innerRadius((d) => d.y0)
					.outerRadius((d) => d.y1 - 1);

				allPaths
					.transition()
					.ease(d3.easeCubic)
					.duration(transitionTime)
					.attrTween('d', function(d, i) {
						return arcTweenPath(d, i);
					});
			});
			window.scrollTo(0, height);
			setTimeout(() => {
				loaded = true;
			}, 500);
		},
		getArtistList(originalData, maxNr = this.maxArtistsPerPage) {
			if (originalData && originalData.track && originalData.track.length) {
				const max = maxNr;
				const page = this.pageNr;
				const data = [...originalData.track];
				return data.splice((page - 1) * max, max);
			} else {
				return [];
			}
		},
		async compareArtistsInit(clicked = false) {
			if (clicked === true) {
				this.state = 'artist';
			}
			if (this.compareArtists.length < 2 && this.state === 'artist') {
				this.state = 'home';
				setTimeout(() => {
					this.createChart();
				});
			}
			const newArtists = await Promise.all(
				this.compareArtists.map(async (index) => {
					const name = this.topArtists[index].name.split(' ').join('+');
					return await this.getArtistInfo(name);
				})
			);
			if (newArtists.length) {
				this.artists = newArtists;
				this.createSecondChart();
			}
		},
		createSecondChart() {
			const artists = this.artists;
			const date = this.getLastWeek(0);
			const lastWeek = this.getLastWeek(7);

			const artistKeys = this.compareArtists.map((index) => {
				return this.topArtists[index].name;
			});

			let names = [];
			let namesCreated = false;
			let dataCreated = artists.map((artist) => {
				let newArtist = [];
				// let totalVal = 0;
				for (let i = lastWeek.getTime() / 1000; i < date.getTime() / 1000; i += 10800) {
					let value = 0;
					if (!namesCreated) {
						names.push(i);
					}
					const contains = artist.filter((singleArtist) => {
						if (singleArtist.date.uts > i && singleArtist.date.uts < i + 10800) {
							return true;
						}
					});
					value = contains.length;
					newArtist.push(value);
				}
				namesCreated = true;
				return newArtist;
			});

			let length = dataCreated[0].length;
			let totals = [];
			for (let i = 0; i < length; i++) {
				let startValue = 0;
				dataCreated.forEach((data, index) => {
					const val = data[i];
					data[i] = [startValue, startValue + data[i], artistKeys[index]];
					startValue += val;
				});
				totals.push(startValue);
			}
			dataCreated.keys = artistKeys;
			dataCreated.names = names;
			dataCreated.totals = totals;

			let height = window.innerHeight,
				width = (window.innerWidth / 4) * 3;

			const element = d3.select('.svg_container--compare');

			const svg = element
				.append('svg')
				.attr('class', 'svg__element--compare')
				.attr('width', width)
				.attr('height', height)
				.attr('viewBox', `0 0 ${width} ${height}`)
				.attr('perserveAspectRatio', 'xMinYMid');
			// .attr('class', 'svg__element-g')
			// .attr('transform', `translate(${width / 2}, ${height / 2})`);

			const margin = { top: 50, right: 40, bottom: 150, left: 40 };
			const margin2 = { top: 430, right: 20, bottom: 30, left: 40 };
			const data = dataCreated;

			const g = svg
				.append('g')
				.attr('class', 'svg__element-g')
				.attr('transform', `translate(${margin.left}, ${margin.top})`);
			var x = d3
				.scaleBand()
				.rangeRound([0, width - margin.left - margin.right])
				.padding(0.3)
				.align(0.3);

			var y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]);

			const color = d3.scaleOrdinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
			x.domain(data.names);
			y.domain([0, d3.max(data.totals)]).nice();

			g.append('g')
				.attr('class', 'axis axis--y')
				.call(d3.axisLeft(y).ticks(10, 's'))
				.append('text')
				.attr('x', 2)
				.attr('y', y(y.ticks(10).pop()))
				.attr('dy', '0.35em')
				.attr('text-anchor', 'start')
				.attr('fill', '#000')
				.text('Population');

			g.append('g')
				.attr('class', 'axis axis--x')
				.attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
				.call(d3.axisBottom(x));

			g.selectAll('.serie')
				.data(data)
				.enter()
				.append('g')
				.attr('class', 'serie')
				.attr('fill', (d, i) => {
					return color(d[i][2]);
				})
				.selectAll('rect')
				.data((d) => {
					return d;
				})
				.enter()
				.append('rect')
				.attr('x', (d, i) => {
					return x(data.names[i]);
				})
				.attr('y', (d) => {
					return y(d[1]);
				})
				.attr('height', (d) => {
					return y(d[0]) - y(d[1]);
				})
				.attr('width', x.bandwidth());
		},
		async getArtistInfo(artist) {
			const apiKey = '9295242e7b99eba039f7147793f3bc23';
			const date = this.getLastWeek(0);
			const lastWeek = this.getLastWeek(7);
			const response = await this.$axios({
				method: 'get',
				url: 'https://ws.audioscrobbler.com/2.0/',
				responseType: 'json',
				params: {
					api_key: apiKey,
					artist: artist,
					startTimestamp: lastWeek.getTime() / 1000,
					endTimestamp: date.getTime() / 1000,
					method: 'user.getArtistTracks',
					format: 'json',
					user: this.userName
				}
			});
			if (response && response.data && response.data.artisttracks && response.data.artisttracks.track) {
				return response.data.artisttracks.track;
			}
		},
		getTimesPlayed(data) {
			const reducer = (accumulator, currentvalue) => accumulator + Number(currentvalue.playcount);
			return data.reduce(reducer, 0);
		},
		artistToCompare(index) {
			const indexOf = this.compareArtists.indexOf(index);
			if (indexOf === -1) {
				this.compareArtists.push(index);
			} else {
				this.compareArtists.splice(indexOf, 1);
			}
		}
	}
};
</script>

<style lang="scss">
@import '~tools';
body,
html {
	background: color(DarkBlue);
	scroll-behavior: smooth;
}
.basic__information {
	height: 100vh;
	width: 100%;
	align-items: center;
	display: flex;
	justify-content: center;
	flex-direction: column;
}
.basic__form-field {
	display: flex;
	flex-direction: column;
	.fieldset {
		display: flex;
		width: 100%;
		justify-content: center;
	}
	h1 {
		color: color(White);
		font-family: $primary-font-family;
		font-weight: normal;
		line-height: 1;
	}
	p {
		font-family: $primary-font-family;
		color: color(White, 0.5);
		text-align: center;
	}
	input {
		width: rem(500);
		height: rem(40);
		border: none;
		box-shadow: none;
		padding: rem(0 20);
		font-family: $secondary-font-family;
		font-size: rem(16);
	}
	button {
		width: rem(40);
		border: none;
		background: transparent;
		box-shadow: none;
		height: rem(40);
		margin: rem(0 20);
		border-radius: 50%;
		border: 4px solid lighten(DarkBlue, 25%);
		color: color(White);
		font-size: rem(20);
		cursor: pointer;
		outline: none;
		position: relative;
		transition: 0.2s ease-in-out;
		&:hover {
			padding-left: 9px;
		}
	}
}
.start {
	display: flex;
	opacity: 0;
	transition: 0.9s ease-in-out 0.4s;
	clip-path: inset(0 100% 0 0);
	&.active {
		clip-path: inset(0 0 0 0);
		.artists__list {
			height: auto;
		}
		opacity: 1;
	}
}
svg {
	display: block;
	text {
		font-family: $secondary-font-family;
		font-size: rem(16);
		z-index: 4;
		position: relative;
		fill: color(White);
	}
	path {
		cursor: pointer;
	}
}
.compare {
	position: fixed;
	top: 0;
	right: 0;
	clip-path: inset(0 0 0 100%);
	transition: 0.2s ease-in-out;
	z-index: 2;
	&--button {
		background: color(White);
		font-size: rem(16);
		font-family: $secondary-font-family;
		border: none;
		box-shadow: none;
		padding: rem(20 15);
		cursor: pointer;
		width: rem(200);
	}
	&.active {
		clip-path: inset(0 0 0 0);
	}
}
.svg_container {
	position: sticky;
	align-self: flex-start;
	top: 0;
	clip-path: inset(0 0 0 0);
	width: 75vw;
	&--compare {
		position: sticky;
		align-self: flex-start;
		top: 0;
		clip-path: inset(0 0 0 0);
		width: 75vw;
	}
}
.artists {
	&__list {
		width: 25vw;
		clip-path: inset(0 0 0 0);
		height: 0;
		overflow: hidden;
		ul {
			width: 100%;
			border-right: 1px solid color(BlueyGrey, 0.5);
			li {
				height: rem(100);
				color: color(White);
				padding: 0;
				&:before {
					content: none;
				}
			}
		}
	}
	&__count {
		&-naming {
			font-size: rem(12);
			color: color(White, 0.5);
		}
	}
	&__link {
		width: 100%;
		padding: rem(0 40);
		font-size: rem(20);
		cursor: pointer;
		border-bottom: 1px solid color(BlueyGrey, 0.5);
		line-height: 1;
		text-decoration: none;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: 0.1s linear;
		&:first-of-type {
			border-top: 1px solid color(BlueyGrey, 0.5);
		}
		&:hover,
		&.hover {
			background: darken(DarkBlue, 4%);
			transition: 0.2s linear;
		}
		&.compared {
			background: darken(DarkBlue, 10%);
			transition: 0.2s linear;
		}
	}
}
.second {
	clip-path: inset(0 100% 0 0);
	transition: clip-path 0.5s ease-in-out 0.5s;
	&.active {
		clip-path: inset(0 0 0 0);
		li {
			color: white;
		}
	}
}
.fade-enter-active,
.fade-leave-active {
	transition: clip-path 0.5s ease-in-out;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	clip-path: inset(0 0 0 100%) !important;
}
</style>

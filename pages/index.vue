<template>
	<main class="page page--home">
		<section v-if="state !== 'artist'" class="basic__information">
			<div class="basic__form-field">
				<h1>Do I really listen to that much music?</h1>
				<p>Enter your Last.fm username to find out more about your listening habits!</p>
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
				v-if="state !== 'artist'"
				id="data"
				:class="{ active : userWeeklyChart.artist && userWeeklyChart.artist.length }"
				class="start"
			>
				<div class="artists__list">
					<ul>
						<li v-for="(artist, index) in getArtistList(userWeeklyChart)" :key="index">
							<span
								:class="{ 'hover': index === hoverElement }"
								:id="index"
								class="artists__link"
								@click="changeState(artist.name)"
							>
								<span class="artists__name">{{ artist.name }}</span>
								<span class="artists__count">
									<span class="artists__count-naming">Times played:</span>
									{{ artist.playcount }}
								</span>
							</span>
						</li>
					</ul>
				</div>
				<div class="svg_container">
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
			totalSongsPlayed: 0,
			hoverElement: -1,
			userWeeklyChart: {},
			artistData: [],
			state: 'home',
			artist: ''
		};
	},
	methods: {
		async getData() {
			const apiKey = '9295242e7b99eba039f7147793f3bc23';
			const date = this.getLastWeek(7);
			const lastWeek = this.getLastWeek(12);
			const response = await this.$axios({
				method: 'get',
				url: 'http://ws.audioscrobbler.com/2.0/',
				responseType: 'json',
				params: {
					api_key: apiKey,
					method: 'user.getWeeklyArtistChart',
					format: 'json',
					from: lastWeek.getTime() / 1000,
					to: date.getTime() / 1000,
					user: this.userName
				}
			});
			if (
				response &&
				response.data &&
				response.data.weeklyartistchart &&
				response.data.weeklyartistchart.artist &&
				response.data.weeklyartistchart.artist.length
			) {
				this.userWeeklyChart = response.data.weeklyartistchart;
				this.createChart();
			}
		},
		getLastWeek(days) {
			const today = new Date();
			return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
		},
		createChart() {
			const reducer = (accumulator, currentvalue) => accumulator + Number(currentvalue.playcount);
			const data = this.getArtistList(this.userWeeklyChart, 7);
			this.totalSongsPlayed = this.userWeeklyChart.artist.reduce(reducer, 0);

			//d3 moments
			let height = window.innerHeight,
				width = window.innerWidth / 2,
				radius = Math.min(width, (height / 5) * 3) / 2,
				transitionTime = 250;

			const color = d3.scaleOrdinal(d3.schemeBlues[8]);

			document.querySelector('.svg_container').innerHTML = '';

			const element = d3.select('.svg_container');

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

			const arc = d3
				.arc()
				.outerRadius(radius - 20)
				.innerRadius(radius - 35);

			const textArc = d3
				.arc()
				.outerRadius(radius + 30)
				.innerRadius(radius);

			const pie = d3
				.pie()
				.startAngle(0 * Math.PI)
				.endAngle(2 * Math.PI)
				.value((d) => d.playcount);
			svg
				.append('g')
				.attr('class', 'middle-text')
				.append('text')
				.attr('transform', 'translate(0, 0)')
				.style('text-anchor', 'middle')
				.text(this.totalSongsPlayed);

			const g = svg
				.selectAll('.arc')
				.data(pie(data))
				.enter()
				.append('g')
				.attr('class', 'arc');

			g.append('path')
				.style('fill', (d) => color(d.data.name))
				.on('mouseover', (d, i) => {
					const el = document.getElementById(i);
					el.scrollIntoView();
					this.hoverElement = i;
				})
				.on('mouseleave', () => {
					this.hoverElement = -1;
				})
				.on('click', (d) => {
					this.changeState(d.data.name);
				})
				.transition()
				.ease(d3.easeCubic)
				.delay((d, i) => i * transitionTime)
				.duration(transitionTime)
				.attrTween('d', (d) => {
					var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
					return function(t) {
						d.endAngle = i(t);
						return arc(d);
					};
				});

			g.append('text')
				.attr('transform', (d) => `translate(${textArc.centroid(d)})`)
				.attr('dy', '.35em')
				.attr('class', 'd3-label')
				.on('mouseover', (d, i) => {
					const el = document.getElementById(i);
					el.scrollIntoView();
					this.hoverElement = i;
				})
				.on('mouseleave', () => {
					this.hoverElement = -1;
				})
				.on('click', (d) => {
					this.changeState(d.data.name);
				})
				.style('text-anchor', 'middle')
				.style('opacity', 0)
				.transition()
				.delay((d, i) => i * transitionTime)
				.duration(transitionTime)
				.style('opacity', 1)
				.text((d) => d.data.name);

			window.addEventListener('resize', () => {
				height = window.innerHeight;
				width = window.innerWidth / 2;
				radius = Math.min(width, (height / 4) * 3) / 2;

				const updateSvg = d3.select('.svg__element');
				const updatePath = d3.select('.arc');
				const updateG = d3.select('.svg__element-g');

				updateSvg
					.attr('width', width)
					.attr('height', height)
					.attr('viewBox', `0 0 ${width} ${height}`)
					.attr('perserveAspectRatio', 'xMinYMid');

				updateG.attr('transform', `translate(${width / 2}, ${height / 2})`);

				updatePath.data(pie(data));
			});
			window.scrollTo(0, height);
		},
		getArtistList(originalData, maxNr = this.maxArtistsPerPage) {
			if (originalData && originalData.artist && originalData.artist.length) {
				const max = maxNr;
				const page = this.pageNr;
				const data = [...originalData.artist];
				return data.splice((page - 1) * max, max);
			} else {
				return [];
			}
		},
		changeState(name) {
			this.state = 'artist';
			this.artist = name.split(' ').join('+');
			this.getArtistInfo(this.artist);
		},
		async getArtistInfo(artist) {
			const apiKey = '9295242e7b99eba039f7147793f3bc23';
			const date = this.getLastWeek(7);
			const lastWeek = this.getLastWeek(12);
			const response = await this.$axios({
				method: 'get',
				url: 'http://ws.audioscrobbler.com/2.0/',
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
				this.artistData = response.data.artisttracks.track;
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
	.middle-text text {
		font-size: rem(32);
	}
}
.svg_container {
	position: sticky;
	align-self: flex-start;
	top: 0;
	clip-path: inset(0 0 0 0);
	width: 50vw;
}
.artists {
	&__list {
		width: 50vw;
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

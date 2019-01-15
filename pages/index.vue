<template>
	<main class="page page--home">
		<section class="start">
			<ul>
				<li v-for="(artist, index) in getAristList()" :key="index">
					{{ artist.name }}
					{{ artist.playcount }}
				</li>
			</ul>
			<div class="svg_container">
			</div>
		</section>
	</main>
</template>

<script>
const d3 = require('d3');
export default {
	data() {
		return {
			pageNr: 1,
			maxArtistsPerPage: 7,
			totalSongsPlayed: 0
		};
	},
	async asyncData({ app }) {
		const apiKey = '9295242e7b99eba039f7147793f3bc23';
		const response = await app.$axios({
			method: 'get',
			url: 'http://ws.audioscrobbler.com/2.0/',
			responseType: 'json',
			params: {
				api_key: apiKey,
				method: 'user.getWeeklyArtistChart',
				format: 'json',
				user: 'dipsaus9'
			}
		});
		if (response && response.data && response.data.weeklyartistchart && response.data.weeklyartistchart.artist) {
			return {
				userWeeklyChart: response.data.weeklyartistchart
			};
		}
	},
	mounted() {
		const reducer = (accumulator, currentvalue) => accumulator + Number(currentvalue.playcount);
		const data = this.getAristList();
		this.totalSongsPlayed = data.reduce(reducer, 0);

		//d3 moments
		let height = (window.innerHeight / 4) * 3,
			width = (window.innerWidth / 4) * 3,
			margin = 50,
			radius = Math.min(width, height) / 2,
			transitionTime = 250;

		const color = d3.scaleOrdinal().range(['#2c3e50', '#2574a9', '#336e7b', '#3a539b']);

		const element = d3.select('.svg_container');

		const svg = element
			.append('svg')
			.attr('class', 'svg__element')
			.attr('width', width + margin)
			.attr('height', height + margin)
			.attr('viewBox', `0 0 ${width + margin} ${height + margin}`)
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
			.startAngle(1.1 * Math.PI)
			.endAngle(3.1 * Math.PI)
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
			.style('text-anchor', 'middle')
			.style('opacity', 0)
			.transition()
			.delay((d, i) => i * transitionTime)
			.duration(transitionTime)
			.style('opacity', 1)
			.text((d) => d.data.name);

		window.addEventListener('resize', () => {
			height = (window.innerHeight / 4) * 3;
			width = (window.innerWidth / 4) * 3;
			margin = 50;
			radius = Math.min(width, height) / 2;

			const updateSvg = d3.select('.svg__element');
			const updatePath = d3.select('.arc');
			const updateG = d3.select('.svg__element-g');

			updateG.attr('transform', `translate(${width / 2}, ${height / 2})`);
			updateSvg
				.attr('width', width + margin)
				.attr('height', height + margin)
				.attr('viewBox', `0 0 ${width + margin} ${height + margin}`)
				.attr('perserveAspectRatio', 'xMinYMid');

			updatePath.data(pie(data));
		});
	},
	methods: {
		getAristList() {
			const max = this.maxArtistsPerPage;
			const page = this.pageNr;
			const data = [...this.userWeeklyChart.artist];
			return data.splice((page - 1) * max, max);
		}
	}
};
</script>

<style lang="scss">
@import '~tools';
svg {
	margin: 0 auto;
	display: block;
	text {
		font-size: rem(32);
		font-family: $main-font-family;
	}
}
</style>

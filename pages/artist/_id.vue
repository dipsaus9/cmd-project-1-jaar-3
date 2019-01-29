<template>
	<main class="page page--home">
		<section class="artist">

		</section>
	</main>
</template>

<script>
const d3 = require('d3');
export default {
	data() {
		return {
			pageNr: 1
		};
	},
	async asyncData({ app, params }) {
		console.log(params);
		const apiKey = '9295242e7b99eba039f7147793f3bc23';
		const response = await app.$axios({
			method: 'get',
			url: 'http://ws.audioscrobbler.com/2.0/',
			responseType: 'json',
			params: {
				api_key: apiKey,
				artist: params.id,
				method: 'user.getArtistTracks',
				format: 'json',
				user: 'dipsaus9'
			}
		});
		if (response && response.data && response.data.artisttracks && response.data.artisttracks.track) {
			return {
				userWeeklyChart: response.data.artisttracks.track
			};
		}
	},
	mounted() {
		console.log(this.userWeeklyChart);
	}
};
</script>

<style lang="scss">
@import '~tools';
</style>

<template>

	<main class="page page--home">
		<section class="intro">
		</section>
	</main>

</template>

<script>
export default {
	mounted() {
		CSS.paintWorklet.addModule('painter.js');
		let root = document.documentElement;
		root.addEventListener('mousemove', (e) => {
			const x = e.clientX > 10 ? e.clientX / 10 : 10;
			root.style.setProperty('--checkerboard-x', x);
			root.style.setProperty('--checkerboard-y', e.clientY / 10);
		});
	}
};
</script>

<style lang="scss">
:root {
	--checkerboard-y: 10;
	--checkerboard-x: 32;
}
.intro {
	background-image: paint(checkerboard);
	width: 100vw;
	height: 100vh;
}
</style>

<template>
	<div class="layout layout-default">
		<layout-header />
		<nuxt />
		<layout-footer />
	</div>
</template>

<script>
import LayoutHeader from '~/components/main/header.vue';
import LayoutFooter from '~/components/main/footer.vue';

export default {
	components: {
		LayoutHeader,
		LayoutFooter
	}
};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		ExternalLink,
		Laptop,
		MessageSquare,
		Send,
		ShieldCheck
	} from '@lucide/svelte';
	import LanguageButton from '$lib/components/language-button.svelte';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import { isLocale, type Locale } from '$lib/i18n/messages';
	import { privacyMessages } from '$lib/i18n/privacy';

	let locale = $state<Locale>('en');
	let activeSection = $state('scope');
	const copy = $derived(privacyMessages[locale]);

	onMount(() => {
		const savedLocale =
			document.documentElement.dataset.presenceLocale ?? localStorage.getItem('presence-locale');
		if (isLocale(savedLocale)) locale = savedLocale;
		document.documentElement.lang = locale;
		void tick().then(() => {
			document.documentElement.classList.remove('presence-preferences-pending');
		});

		const policySections = Array.from(
			document.querySelectorAll<HTMLElement>('.policy > section[id]')
		);
		let scrollFrame: number | undefined;

		function updateActiveSection() {
			scrollFrame = undefined;
			const readingLine = Math.min(window.innerHeight * 0.28, 240);
			let nextSection = policySections[0]?.id ?? 'scope';

			for (const section of policySections) {
				if (section.getBoundingClientRect().top > readingLine) break;
				nextSection = section.id;
			}

			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
				nextSection = policySections.at(-1)?.id ?? nextSection;
			}

			activeSection = nextSection;
		}

		function scheduleSectionUpdate() {
			if (scrollFrame !== undefined) return;
			scrollFrame = window.requestAnimationFrame(updateActiveSection);
		}

		updateActiveSection();
		window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
		window.addEventListener('resize', scheduleSectionUpdate);

		return () => {
			if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
			window.removeEventListener('scroll', scheduleSectionUpdate);
			window.removeEventListener('resize', scheduleSectionUpdate);
		};
	});

	function setLocale(nextLocale: Locale) {
		locale = nextLocale;
		localStorage.setItem('presence-locale', nextLocale);
		document.documentElement.dataset.presenceLocale = nextLocale;
		document.documentElement.lang = nextLocale;
	}
</script>

<svelte:head>
	<title>{copy.meta.title}</title>
	<meta name="description" content={copy.meta.description} />
</svelte:head>

<a class="skip-link" href="#privacy-content">{copy.navigation.skip}</a>

<header class="privacy-header">
	<a class="brand" href={resolve('/')} aria-label={copy.navigation.home}>
		<img
			class="brand-lockup"
			src="/presence-logo-assets/presence-lockup.svg"
			alt=""
			width="191"
			height="40"
		/>
	</a>
	<div class="header-actions">
		<a class="back-link" href={resolve('/')}>
			<ArrowLeft size={16} aria-hidden="true" />
			<span>{copy.navigation.back}</span>
		</a>
		<LanguageButton {locale} ariaLabel={copy.navigation.language} onLocaleChange={setLocale} />
	</div>
</header>

<main id="privacy-content">
	<section class="privacy-hero" aria-labelledby="privacy-title">
		<div class="hero-copy">
			<p class="eyebrow">{copy.hero.eyebrow}</p>
			<h1 id="privacy-title">{copy.hero.title}</h1>
			<p class="hero-description">{copy.hero.description}</p>
			<div class="dates">
				<span>{copy.hero.effective}</span>
				<span>{copy.hero.updated}</span>
			</div>
		</div>
		<div class="privacy-signal" aria-hidden="true">
			<div class="signal-icon">
				<ShieldCheck size={34} strokeWidth={1.6} />
			</div>
			<span>{copy.hero.badge}</span>
			<strong>{copy.highlights[0].title}</strong>
			<div class="signal-lines"><i></i><i></i><i></i></div>
		</div>
	</section>

	<aside class="service-notice" aria-labelledby="service-note-title">
		<ShieldCheck size={21} aria-hidden="true" />
		<div>
			<h2 id="service-note-title">{copy.serviceNotice.title}</h2>
			<p>{copy.serviceNotice.body}</p>
		</div>
	</aside>

	<section class="privacy-highlights" aria-label={copy.hero.title}>
		{#each copy.highlights as highlight, index (highlight.title)}
			<article>
				<div class="highlight-icon" aria-hidden="true">
					{#if index === 0}
						<ShieldCheck size={19} />
					{:else if index === 1}
						<Laptop size={19} />
					{:else}
						<Send size={19} />
					{/if}
				</div>
				<p>{highlight.label}</p>
				<h2>{highlight.title}</h2>
				<span>{highlight.body}</span>
			</article>
		{/each}
	</section>

	<div class="policy-layout">
		<nav class="policy-toc" aria-label={copy.contentsLabel}>
			<p>{copy.contentsLabel}</p>
			<ol>
				{#each copy.sections as section (section.id)}
					<li>
						<a
							href={`#${section.id}`}
							class:active={activeSection === section.id}
							aria-current={activeSection === section.id ? 'location' : undefined}
							onclick={() => (activeSection = section.id)}
						>
							<span>{section.number}</span>
							<strong>{section.title}</strong>
						</a>
					</li>
				{/each}
			</ol>
		</nav>

		<article class="policy">
			{#each copy.sections as section (section.id)}
				<section id={section.id} aria-labelledby={`${section.id}-title`}>
					<div class="section-heading">
						<span>{section.number}</span>
						<h2 id={`${section.id}-title`}>{section.title}</h2>
					</div>

					{#each section.paragraphs as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}

					{#if section.items.length}
						<div class="data-list">
							{#each section.items as item (item.title)}
								<div>
									<h3>{item.title}</h3>
									<p>{item.body}</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if section.id === 'providers'}
						<div class="provider-links">
							<p>{copy.providerLinks.label}</p>
							<a
								href="https://www.perfectcorp.com/perfectbeauty/youcam/terms-of-service-api"
								target="_blank"
								rel="noreferrer"
								>{copy.providerLinks.perfectTerms}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a
								href="https://www.perfectcorp.com/youcamapps/youcam/privacy-policy.html"
								target="_blank"
								rel="noreferrer"
								>{copy.providerLinks.perfectPrivacy}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer"
								>{copy.providerLinks.vercel}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
								>{copy.providerLinks.google}<ExternalLink size={14} aria-hidden="true" /></a
							>
						</div>
					{/if}
				</section>
			{/each}

			<aside class="contact-card" aria-labelledby="contact-card-title">
				<MessageSquare size={22} aria-hidden="true" />
				<div>
					<p>{copy.contact.label}</p>
					<h2 id="contact-card-title">{copy.contact.title}</h2>
					<span>{copy.contact.body}</span>
				</div>
			</aside>
		</article>
	</div>
</main>

<SiteFooter
	tagline={copy.footer.tagline}
	disclaimer={copy.serviceNotice.body}
	source={copy.footer.source}
	status={copy.footer.status}
	navigationLabel={copy.footer.navigation}
	primaryHref="/"
	primaryLabel={copy.footer.home}
/>

<style>
	:global(:root) {
		--privacy-ink: #1f2933;
		--privacy-muted: #66727d;
		--privacy-cream: #f6f7f8;
		--privacy-line: #d9dee3;
		--privacy-blue: #2f628f;
		--privacy-paper: #fff;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		color: var(--privacy-ink);
		background: var(--privacy-cream);
		overflow-x: hidden;
	}
	.skip-link {
		position: fixed;
		top: 10px;
		left: 10px;
		z-index: 20;
		padding: 10px 14px;
		border-radius: 4px;
		background: var(--privacy-ink);
		color: white;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
		transform: translateY(-160%);
		transition: transform 0.16s ease;
	}
	.skip-link:focus-visible {
		transform: translateY(0);
	}
	.privacy-header {
		height: 80px;
		max-width: 1180px;
		margin: auto;
		padding: 0 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--privacy-line);
	}
	.brand {
		min-height: 44px;
		display: flex;
		align-items: center;
		color: var(--privacy-ink);
		font-size: 16px;
		font-weight: 700;
		text-decoration: none;
	}
	.brand-lockup {
		display: block;
		width: auto;
		height: 32px;
	}
	.header-actions,
	.back-link {
		display: flex;
		align-items: center;
	}
	.header-actions {
		gap: 18px;
	}
	.back-link {
		min-height: 44px;
		gap: 7px;
		color: var(--privacy-muted);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
	}
	.back-link:hover {
		color: var(--privacy-ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	main {
		max-width: 1180px;
		margin: auto;
		padding: 0 30px 100px;
	}
	.privacy-hero {
		max-width: 880px;
		padding: 92px 0 48px;
	}
	.eyebrow {
		margin: 0 0 18px;
		color: var(--privacy-blue);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	.privacy-hero h1 {
		max-width: 820px;
		margin: 0;
		font:
			500 clamp(42px, 5.4vw, 66px) / 1.08 Georgia,
			'Times New Roman',
			serif;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}
	.hero-description {
		max-width: 760px;
		margin: 28px 0 0;
		color: var(--privacy-muted);
		font-size: 17px;
		line-height: 1.75;
		text-wrap: pretty;
	}
	.dates {
		display: flex;
		gap: 16px;
		margin-top: 26px;
		color: #7c8790;
		font-size: 11px;
		font-weight: 700;
	}
	.dates span + span {
		padding-left: 16px;
		border-left: 1px solid var(--privacy-line);
	}
	.service-notice {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 14px;
		padding: 20px 22px;
		border: 1px solid #cbd7df;
		border-left: 3px solid var(--privacy-blue);
		border-radius: 7px;
		background: #f0f4f7;
	}
	.service-notice > :global(svg) {
		margin-top: 2px;
		color: var(--privacy-blue);
	}
	.service-notice h2 {
		margin: 0;
		font-size: 14px;
	}
	.service-notice p {
		margin: 6px 0 0;
		color: #5f6d78;
		font-size: 12px;
		line-height: 1.65;
	}
	.privacy-highlights {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin: 34px 0 88px;
		border: 1px solid var(--privacy-line);
		border-radius: 8px;
		background: var(--privacy-paper);
	}
	.privacy-highlights article {
		min-height: 208px;
		padding: 27px;
	}
	.privacy-highlights article + article {
		border-left: 1px solid var(--privacy-line);
	}
	.highlight-icon {
		width: 38px;
		height: 38px;
		display: grid;
		place-items: center;
		margin-bottom: 23px;
		border-radius: 6px;
		background: #edf2f5;
		color: #3e647e;
	}
	.privacy-highlights p {
		margin: 0 0 8px;
		color: #81909b;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.privacy-highlights h2 {
		margin: 0;
		font-size: 16px;
		line-height: 1.35;
	}
	.privacy-highlights article > span {
		display: block;
		margin-top: 10px;
		color: var(--privacy-muted);
		font-size: 12px;
		line-height: 1.6;
	}
	.policy-layout {
		display: grid;
		grid-template-columns: 225px minmax(0, 1fr);
		grid-template-areas: 'toc policy';
		gap: 75px;
		align-items: start;
	}
	.policy-toc {
		grid-area: toc;
		display: block;
		min-width: 0;
		position: sticky;
		top: 28px;
		padding-top: 6px;
	}
	.policy-toc > p {
		margin: 0 0 14px;
		color: #85919a;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.policy-toc ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.policy-toc li {
		border-top: 1px solid var(--privacy-line);
	}
	.policy-toc li:last-child {
		border-bottom: 1px solid var(--privacy-line);
	}
	.policy-toc a {
		display: block;
		padding: 11px 2px;
		color: #697680;
		font-size: 11px;
		line-height: 1.45;
		text-decoration: none;
	}
	.policy-toc a:hover {
		color: var(--privacy-blue);
	}
	.policy {
		grid-area: policy;
		width: 100%;
		min-width: 0;
	}
	.policy > section {
		scroll-margin-top: 28px;
		padding: 0 0 58px;
	}
	.policy > section + section {
		padding-top: 58px;
		border-top: 1px solid var(--privacy-line);
	}
	.section-heading {
		display: grid;
		grid-template-columns: 34px 1fr;
		gap: 13px;
		align-items: baseline;
		margin-bottom: 23px;
	}
	.section-heading span {
		color: var(--privacy-blue);
		font-size: 11px;
		font-weight: 800;
	}
	.section-heading h2 {
		margin: 0;
		font-size: 26px;
		line-height: 1.25;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}
	.policy section > p {
		margin: 0 0 16px;
		color: #53616c;
		font-size: 14px;
		line-height: 1.85;
		text-wrap: pretty;
	}
	.data-list {
		margin-top: 25px;
		border: 1px solid var(--privacy-line);
		border-radius: 7px;
		background: var(--privacy-paper);
	}
	.data-list > div {
		display: grid;
		grid-template-columns: minmax(150px, 0.36fr) 1fr;
		gap: 28px;
		padding: 20px 22px;
	}
	.data-list > div + div {
		border-top: 1px solid var(--privacy-line);
	}
	.data-list h3 {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
	}
	.data-list p {
		margin: 0;
		color: #65727c;
		font-size: 12px;
		line-height: 1.7;
	}
	.provider-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 9px 16px;
		margin-top: 22px;
		padding: 16px 18px;
		border-radius: 6px;
		background: #edf1f3;
	}
	.provider-links p {
		width: 100%;
		margin: 0 0 2px;
		color: #77858e;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.11em;
		text-transform: uppercase;
	}
	.provider-links a {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: #365f7b;
		font-size: 11px;
		font-weight: 700;
		text-underline-offset: 3px;
	}
	.contact-card {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 16px;
		align-items: center;
		padding: 24px;
		border: 1px solid #cbd7df;
		border-radius: 8px;
		background: #f0f4f7;
	}
	.contact-card > :global(svg) {
		color: var(--privacy-blue);
	}
	.contact-card p {
		margin: 0 0 5px;
		color: #7a8892;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.contact-card h2 {
		margin: 0;
		font-size: 16px;
	}
	.contact-card span {
		display: block;
		margin-top: 7px;
		color: #65727c;
		font-size: 11px;
		line-height: 1.55;
	}
	@media (max-width: 820px) {
		.privacy-highlights {
			grid-template-columns: 1fr;
		}
		.privacy-highlights article {
			min-height: 0;
		}
		.privacy-highlights article + article {
			border-top: 1px solid var(--privacy-line);
			border-left: 0;
		}
		.policy-layout {
			grid-template-columns: 1fr;
			grid-template-areas:
				'toc'
				'policy';
			gap: 48px;
		}
		.policy-toc {
			position: static;
		}
		.policy-toc ol {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.policy-toc li:nth-child(2) {
			border-top: 1px solid var(--privacy-line);
		}
		.policy-toc li:nth-child(odd) {
			padding-right: 14px;
		}
		.policy-toc li:nth-child(even) {
			padding-left: 14px;
			border-left: 1px solid var(--privacy-line);
		}
	}
	@media (max-width: 620px) {
		.privacy-header {
			height: 68px;
			padding: 0 18px;
		}
		.brand-lockup {
			height: 29px;
		}
		.back-link {
			display: none;
		}
		main {
			padding: 0 18px 72px;
		}
		.privacy-hero {
			padding: 62px 0 38px;
		}
		.privacy-hero h1 {
			font-size: clamp(38px, 11vw, 48px);
		}
		.hero-description {
			font-size: 15px;
		}
		.dates {
			flex-direction: column;
			gap: 5px;
		}
		.dates span + span {
			padding-left: 0;
			border-left: 0;
		}
		.service-notice {
			padding: 18px;
		}
		.privacy-highlights {
			margin: 25px 0 60px;
		}
		.privacy-highlights article {
			padding: 23px;
		}
		.policy-toc ol {
			display: block;
		}
		.policy-toc li,
		.policy-toc li:nth-child(odd),
		.policy-toc li:nth-child(even) {
			padding-right: 0;
			padding-left: 0;
			border-left: 0;
		}
		.policy-toc li:nth-child(2) {
			border-top: 1px solid var(--privacy-line);
		}
		.section-heading {
			grid-template-columns: 27px 1fr;
		}
		.section-heading h2 {
			font-size: 22px;
		}
		.data-list > div {
			grid-template-columns: 1fr;
			gap: 7px;
			padding: 18px;
		}
		.provider-links {
			align-items: flex-start;
			flex-direction: column;
		}
		.provider-links p {
			width: auto;
		}
		.contact-card {
			padding: 20px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skip-link {
			transition: none;
		}
	}

	:global(:root) {
		--privacy-ink: #202b33;
		--privacy-muted: #64717b;
		--privacy-cream: #f4f6f8;
		--privacy-line: #dbe2e7;
		--privacy-blue: #315f81;
		--privacy-blue-dark: #244a68;
		--privacy-blue-soft: #eaf1f6;
		--privacy-paper: #fff;
	}
	.privacy-header {
		height: 88px;
		max-width: 1240px;
		padding: 0 32px;
		border-bottom-color: rgba(52, 70, 82, 0.1);
	}
	main {
		max-width: 1240px;
		padding: 44px 32px 112px;
	}
	.privacy-hero {
		position: relative;
		max-width: none;
		min-height: 468px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 246px;
		gap: 64px;
		align-items: center;
		overflow: hidden;
		padding: 64px 68px;
		border: 1px solid #d7e0e7;
		border-radius: 22px;
		background:
			radial-gradient(circle at 87% 12%, rgba(142, 181, 207, 0.28), transparent 30%),
			linear-gradient(135deg, #fbfcfd 0%, #edf3f7 100%);
		box-shadow: 0 24px 70px rgba(40, 69, 88, 0.08);
	}
	.privacy-hero::before {
		content: '';
		position: absolute;
		right: -124px;
		bottom: -195px;
		width: 410px;
		height: 410px;
		border: 1px solid rgba(49, 95, 129, 0.12);
		border-radius: 50%;
		box-shadow:
			0 0 0 48px rgba(49, 95, 129, 0.035),
			0 0 0 96px rgba(49, 95, 129, 0.025);
	}
	.hero-copy,
	.privacy-signal {
		position: relative;
		z-index: 1;
	}
	.eyebrow {
		margin-bottom: 16px;
		color: #5b6d79;
		font-size: 10px;
		letter-spacing: 0.1em;
	}
	.privacy-hero h1 {
		max-width: 790px;
		font-family: inherit;
		font-size: clamp(44px, 5vw, 64px);
		font-weight: 720;
		line-height: 1.06;
		letter-spacing: -0.048em;
	}
	.hero-description {
		max-width: 720px;
		margin-top: 23px;
		color: #5d6b75;
		font-size: 16px;
		line-height: 1.7;
	}
	.dates {
		gap: 10px;
		margin-top: 25px;
	}
	.dates span {
		padding: 7px 10px;
		border: 1px solid rgba(49, 95, 129, 0.12);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.62);
		color: #6a7882;
		font-size: 10px;
	}
	.dates span + span {
		padding-left: 10px;
		border-left: 1px solid rgba(49, 95, 129, 0.12);
	}
	.privacy-signal {
		min-height: 264px;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		flex-direction: column;
		padding: 30px;
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.58);
		box-shadow: 0 18px 55px rgba(42, 76, 99, 0.1);
		backdrop-filter: blur(14px);
	}
	.signal-icon {
		width: 58px;
		height: 58px;
		display: grid;
		place-items: center;
		margin-bottom: 28px;
		border-radius: 16px;
		background: var(--privacy-blue-dark);
		color: #fff;
		box-shadow: 0 12px 30px rgba(36, 74, 104, 0.2);
	}
	.privacy-signal > span {
		color: #72818b;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.privacy-signal strong {
		margin-top: 8px;
		color: var(--privacy-ink);
		font-size: 16px;
		line-height: 1.35;
	}
	.signal-lines {
		width: 100%;
		display: flex;
		gap: 6px;
		margin-top: 26px;
	}
	.signal-lines i {
		height: 4px;
		flex: 1;
		border-radius: 999px;
		background: #ccdae3;
	}
	.signal-lines i:first-child {
		background: var(--privacy-blue);
	}
	.service-notice {
		margin-top: 20px;
		padding: 22px 24px;
		border: 1px solid #d6e1e8;
		border-left: 1px solid #d6e1e8;
		border-radius: 13px;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 10px 32px rgba(45, 72, 90, 0.05);
	}
	.service-notice > :global(svg) {
		width: 38px;
		height: 38px;
		margin: 0;
		padding: 9px;
		border-radius: 10px;
		background: var(--privacy-blue-soft);
	}
	.service-notice h2 {
		font-size: 14px;
		line-height: 1.4;
	}
	.service-notice p {
		max-width: 980px;
		margin-top: 5px;
		font-size: 12px;
		line-height: 1.65;
	}
	.privacy-highlights {
		gap: 14px;
		margin: 22px 0 80px;
		border: 0;
		background: transparent;
	}
	.privacy-highlights article {
		min-height: 215px;
		padding: 27px;
		border: 1px solid var(--privacy-line);
		border-radius: 15px;
		background: var(--privacy-paper);
		box-shadow: 0 12px 38px rgba(42, 65, 79, 0.055);
	}
	.privacy-highlights article + article {
		border-left: 1px solid var(--privacy-line);
	}
	.highlight-icon {
		width: 42px;
		height: 42px;
		margin-bottom: 26px;
		border-radius: 11px;
		background: var(--privacy-blue-soft);
		color: var(--privacy-blue-dark);
	}
	.privacy-highlights p {
		color: #74838e;
		font-size: 9px;
		letter-spacing: 0.11em;
	}
	.privacy-highlights h2 {
		font-size: 17px;
		letter-spacing: -0.015em;
	}
	.privacy-highlights article > span {
		margin-top: 9px;
		font-size: 12px;
		line-height: 1.65;
	}
	.policy-layout {
		grid-template-columns: 250px minmax(0, 1fr);
		gap: 34px;
	}
	.policy-toc {
		top: 20px;
		padding: 18px;
		border: 1px solid var(--privacy-line);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 16px 45px rgba(42, 65, 79, 0.07);
		backdrop-filter: blur(14px);
	}
	.policy-toc > p {
		margin: 0 10px 12px;
		color: #72818b;
		font-size: 9px;
		letter-spacing: 0.12em;
	}
	.policy-toc li,
	.policy-toc li:last-child {
		border: 0;
	}
	.policy-toc a {
		min-height: 48px;
		display: grid;
		grid-template-columns: 27px minmax(0, 1fr);
		gap: 8px;
		align-items: center;
		margin: 3px 0;
		padding: 9px 10px;
		border: 1px solid transparent;
		border-radius: 10px;
		color: #6d7a84;
		font-size: 11px;
		line-height: 1.35;
		transition:
			border-color 0.16s ease,
			background-color 0.16s ease,
			box-shadow 0.16s ease,
			color 0.16s ease,
			transform 0.16s ease;
	}
	.policy-toc a > span {
		color: #87959f;
		font-size: 9px;
		font-weight: 800;
	}
	.policy-toc a > strong {
		font-weight: 650;
	}
	.policy-toc a:hover {
		background: #f4f7f9;
		color: var(--privacy-blue-dark);
		transform: translateX(2px);
	}
	.policy-toc a.active {
		border-color: #d4e1e9;
		background: var(--privacy-blue-soft);
		box-shadow: inset 3px 0 0 var(--privacy-blue);
		color: var(--privacy-blue-dark);
	}
	.policy-toc a.active > span {
		color: var(--privacy-blue);
	}
	.policy {
		display: grid;
		gap: 18px;
	}
	.policy > section,
	.policy > section + section {
		scroll-margin-top: 24px;
		padding: 38px 42px 42px;
		border: 1px solid var(--privacy-line);
		border-radius: 18px;
		background: var(--privacy-paper);
		box-shadow: 0 14px 45px rgba(42, 65, 79, 0.055);
	}
	.section-heading {
		grid-template-columns: 34px minmax(0, 1fr);
		gap: 14px;
		align-items: center;
		margin-bottom: 24px;
	}
	.section-heading span {
		width: 32px;
		height: 28px;
		display: grid;
		place-items: center;
		border-radius: 8px;
		background: var(--privacy-blue-soft);
		color: var(--privacy-blue-dark);
		font-size: 9px;
	}
	.section-heading h2 {
		font-size: clamp(22px, 2.3vw, 28px);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.035em;
	}
	.policy section > p {
		margin-bottom: 17px;
		color: #53616c;
		font-size: 14px;
		line-height: 1.85;
	}
	.data-list {
		overflow: hidden;
		margin-top: 27px;
		border-color: #dce4e9;
		border-radius: 12px;
		background: #f7f9fa;
	}
	.data-list > div {
		grid-template-columns: minmax(155px, 0.34fr) minmax(0, 1fr);
		gap: 30px;
		padding: 23px 24px;
	}
	.data-list > div + div {
		border-top-color: #dfe6ea;
	}
	.data-list h3 {
		color: #34424c;
		font-size: 13px;
		font-weight: 700;
	}
	.data-list p {
		color: #62707a;
		font-size: 12px;
		line-height: 1.75;
	}
	.provider-links {
		gap: 10px 18px;
		margin-top: 24px;
		padding: 18px 20px;
		border: 1px solid #d9e4ea;
		border-radius: 11px;
		background: var(--privacy-blue-soft);
	}
	.provider-links a {
		min-height: 32px;
		color: var(--privacy-blue-dark);
		font-size: 11px;
	}
	.contact-card {
		gap: 18px;
		padding: 29px 30px;
		border-color: #d2e0e8;
		border-radius: 16px;
		background: linear-gradient(135deg, #eaf1f6, #f7f9fb);
		box-shadow: 0 14px 42px rgba(42, 65, 79, 0.055);
	}
	.contact-card > :global(svg) {
		width: 42px;
		height: 42px;
		padding: 10px;
		border-radius: 12px;
		background: var(--privacy-paper);
	}
	.contact-card h2 {
		font-size: 17px;
	}
	.contact-card span {
		max-width: 720px;
		font-size: 12px;
		line-height: 1.65;
	}
	@media (max-width: 980px) {
		.privacy-hero {
			grid-template-columns: minmax(0, 1fr) 220px;
			gap: 42px;
			padding: 56px 50px;
		}
		.policy-layout {
			grid-template-columns: 225px minmax(0, 1fr);
			gap: 24px;
		}
		.policy-toc {
			padding: 14px;
		}
		.policy > section,
		.policy > section + section {
			padding: 34px;
		}
	}
	@media (max-width: 820px) {
		.privacy-hero {
			grid-template-columns: 1fr;
			min-height: 0;
		}
		.privacy-signal {
			display: none;
		}
		.privacy-highlights article + article {
			border-left: 1px solid var(--privacy-line);
		}
		.policy-layout {
			grid-template-columns: 1fr;
			grid-template-areas:
				'toc'
				'policy';
			gap: 22px;
		}
		.policy-toc {
			position: sticky;
			top: 0;
			z-index: 8;
			margin: 0 -32px;
			padding: 10px 32px;
			border-right: 0;
			border-left: 0;
			border-radius: 0;
			box-shadow: 0 8px 24px rgba(42, 65, 79, 0.08);
		}
		.policy-toc > p {
			display: none;
		}
		.policy-toc ol {
			display: flex;
			gap: 6px;
			overflow-x: auto;
			scrollbar-width: none;
		}
		.policy-toc ol::-webkit-scrollbar {
			display: none;
		}
		.policy-toc li,
		.policy-toc li:nth-child(odd),
		.policy-toc li:nth-child(even) {
			flex: none;
			padding: 0;
			border: 0;
		}
		.policy-toc a {
			grid-template-columns: auto auto;
			min-height: 42px;
			margin: 0;
			padding: 8px 12px;
			white-space: nowrap;
		}
		.policy-toc a:hover {
			transform: none;
		}
		.policy > section,
		.policy > section + section {
			scroll-margin-top: 80px;
		}
	}
	@media (max-width: 620px) {
		.privacy-header {
			height: 68px;
			padding: 0 18px;
		}
		main {
			padding: 24px 18px 76px;
		}
		.privacy-hero {
			padding: 42px 26px;
			border-radius: 17px;
		}
		.privacy-hero h1 {
			font-size: clamp(38px, 11vw, 48px);
		}
		.hero-description {
			font-size: 15px;
		}
		.dates {
			align-items: flex-start;
			flex-direction: column;
			gap: 7px;
		}
		.dates span + span {
			padding-left: 10px;
			border-left: 1px solid rgba(49, 95, 129, 0.12);
		}
		.service-notice {
			grid-template-columns: 34px minmax(0, 1fr);
			padding: 18px;
		}
		.service-notice > :global(svg) {
			width: 34px;
			height: 34px;
			padding: 8px;
		}
		.privacy-highlights {
			margin: 16px 0 54px;
		}
		.privacy-highlights article {
			padding: 24px;
		}
		.privacy-highlights article + article {
			border-top: 1px solid var(--privacy-line);
		}
		.policy-toc {
			margin: 0 -18px;
			padding: 9px 18px;
		}
		.policy > section,
		.policy > section + section {
			padding: 27px 22px 30px;
			border-radius: 14px;
		}
		.section-heading {
			grid-template-columns: 32px minmax(0, 1fr);
			gap: 11px;
		}
		.section-heading h2 {
			font-size: 22px;
		}
		.data-list > div {
			grid-template-columns: 1fr;
			gap: 7px;
			padding: 19px;
		}
		.provider-links {
			align-items: flex-start;
			flex-direction: column;
		}
		.contact-card {
			align-items: start;
			padding: 23px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.policy-toc a {
			transition: none;
		}
	}
</style>

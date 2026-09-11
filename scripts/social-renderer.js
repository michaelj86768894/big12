/* Shared card rendering for the homepage and GLFL Social. */
window.GLFLSocial = (() => {
    const siteRoot = new URL('../', document.currentScript.src);
    const teams = ['Boston', 'Brooklyn', 'Cedar Rapids', 'Chicago', 'Cleveland', 'Los Angeles', 'Miami', 'Milwaukee', 'Northern Arizona', 'Philadelphia', 'Tucson', 'Vegas'];
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
    const accountClass = post => post.accountType === 'league' || post.reporter === 'GLFL'
        ? 'is-official' : post.accountType === 'team' || teams.some(team => (post.reporter || '').includes(team)) ? 'is-team' : '';
    function safeUrl(value, base) {
        if (!value) return '';
        try {
            const url = new URL(value, base);
            return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : '';
        } catch { return ''; }
    }
    function account(post) {
        const initials = (post.reporter || 'GLFL').split(/\s+/).map(word => word[0]).join('').slice(0, 3).toUpperCase();
        const profile = safeUrl(post.profile, siteRoot);
        const kind = accountClass(post);
        const badge = kind ? '<span class="social-account-badge">' + (kind === 'is-official' ? 'League' : 'Team') + '</span>' : '';
        return '<div class="social-account"><div class="social-avatar" aria-hidden="true"><span>' + escape(initials) + '</span>' + (profile ? '<img src="' + escape(profile) + '" alt="" loading="lazy">' : '') + '</div><div class="social-account-name"><strong>' + escape(post.reporter) + '</strong>' + badge + '<span class="social-handle">' + escape(post.handle) + '</span></div></div>';
    }
    const compact = new Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 1});
    function engagement(post) {
        const values = [['likes', '♡'], ['reposts', '↻']].flatMap(([key, icon]) => {
            const value = post[key];
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return [];
            const count = Math.floor(value);
            const label = count.toLocaleString('en-US') + ' ' + key;
            return ['<span aria-label="' + label + '" title="' + label + '"><span aria-hidden="true">' + icon + ' ' + compact.format(count) + '</span></span>'];
        });
        return values.length ? '<div class="social-engagement">' + values.join('') + '</div>' : '';
    }
    function card(post, byId) {
        const quoted = post.quotePost && post.quotePost !== post.id ? byId.get(post.quotePost) : null;
        // Render one quote level only so cyclic references cannot recurse.
        const quote = quoted ? '<blockquote class="social-quote ' + accountClass(quoted) + '" aria-label="Quoted post">' + account(quoted) + '<p>' + escape(quoted.text) + '</p><time class="social-time">' + escape(quoted.time) + '</time></blockquote>' : '';
        const link = safeUrl(post.link, document.baseURI);
        return '<article class="social-post ' + accountClass(post) + '">' + account(post) + '<div class="social-bureau">' + escape(post.bureau) + '</div><div class="social-type">' + escape(post.type) + '</div><p>' + escape(post.text) + '</p>' + quote + (link ? '<a class="social-article-link" href="' + escape(link) + '">' + escape(post.linkText || 'Read Article') + ' &rarr;</a>' : '') + '<time class="social-time">' + escape(post.time) + '</time>' + engagement(post) + '</article>';
    }
    function render(container, visible, all) {
        const byId = new Map();
        all.forEach(post => { if (post.id && !byId.has(post.id)) byId.set(post.id, post); });
        container.innerHTML = visible.length ? visible.map(post => card(post, byId)).join('') : '<p class="social-empty">No posts match this filter yet.</p>';
        container.querySelectorAll('.social-avatar img').forEach(img => {
            const failed = () => img.remove();
            img.addEventListener('error', failed, {once: true});
            if (img.complete && !img.naturalWidth) failed();
        });
    }
    function matches(post, filter) {
        if (filter === 'all') return true;
        const searchable = [post.category, post.type, post.text, post.linkText].filter(Boolean).join(' ').toLowerCase();
        if (filter === 'breaking') return searchable.includes('breaking') || searchable.includes('trade');
        if (filter === 'rumor') return /rumor|chatter|sources say/.test(searchable);
        if (filter === 'article') return searchable.includes('article') || Boolean(post.link);
        if (filter === 'roster move') return /roster/.test(searchable);
        return searchable.includes(filter);
    }
    return {render, matches};
})();

const expandHex = hex => '#' + [...hex.slice(1)].map(c => c + c).join('');
const RGBtoHEX = color => {
    const hex = color.length === 4 ? expandHex(color) : color;

    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
};
const isDarkColor = color => {
    const { r, g, b } = RGBtoHEX(color);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 100;
};
const getNewColor = (color, percent) => {
    const { r, g, b } = RGBtoHEX(color);
    const adjust = v => Math.min(255, Math.max(0, v + v * percent));

    return '#' + [r, g, b]
        .map(x => Math.round(adjust(x)).toString(16).padStart(2, '0'))
        .join('');
};

class ThemeController {
    constructor(root, colorPicker) {
        this.root = root;
        this.colorPicker = colorPicker;
        this.init();
    }

    init() {
        this.colorPicker.addEventListener('input', () => this.applyTheme());
    }
    applyTheme() {
        const color = this.colorPicker.value;

        this.root.classList.toggle('m-dark-mode', isDarkColor(color));
        this.root.style.setProperty('--dark-bg', getNewColor(color, -0.3));
        this.root.style.setProperty('--main-bg', color);
        this.root.style.setProperty('--light-bg', getNewColor(color, 0.75));
    }
}

class AnimTitle {
    constructor(title, observer) {
        this.title = title;
        this.observer = observer;
        this.init();
    }

    init() {
        const fragment = document.createDocumentFragment();
        [...this.title.textContent].forEach((letter, index) => {
            const b = document.createElement('b');
            b.className = 'c-anim-card';
            b.dataset.letter = letter;
            b.addEventListener('animationstart', () => {
                setTimeout(() => b.nextElementSibling?.classList.add('m-in-viewport'), 30);
                setTimeout(() => b.classList.remove('m-in-viewport'), 1000);
            });
            if (!index) this.observer.observe(b);
            fragment.append(b);
        });
        this.title.textContent = '';
        this.title.append(fragment);
    }
}

class AsidePanel {
    constructor(control, aside) {
        this.control = control;
        this.aside = aside;
    }

    toggle() {
        this.aside.classList.toggle('m-open')
    }
    close() {
        this.aside.classList.remove('m-open');
    }
    contains(target) {
        return this.aside.contains(target);
    }
}

class AsideController {
    constructor() {
        const toggles = document.querySelectorAll('[data-toggle]');
        this.panels = [...toggles].map(toggle => {
            const aside = document.getElementById(toggle.dataset.toggle);
            const panel = new AsidePanel(toggle, aside);
            toggle.addEventListener('click', () => panel.toggle());

            return panel;
        });

        this.init();
    }

    init() {
        document.addEventListener('click', e => {
            this.panels.forEach(panel => {
                const isOwnToggle = panel.control.contains(e.target);
                const isAsideChild = panel.contains(e.target);

                if (!isOwnToggle && !isAsideChild) {
                    panel.close();
                }
            });
        })
    }
}

const root = document.documentElement;
const demoButton = document.getElementById('demoButton');
const animTitles = document.querySelectorAll('[data-anim-title]');
const animElements = document.querySelectorAll('[data-scroll-anim]');
const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, boundingClientRect, isIntersecting }) => {
        target.classList.toggle('m-top', boundingClientRect.top < 0);
        target.classList.toggle('m-in-viewport', isIntersecting);
    });
});

demoButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    root.classList.remove('m-start-screen');
});

animElements.forEach(el => observer.observe(el));
animTitles.forEach(title => new AnimTitle(title, observer));

new ThemeController(root, document.getElementById('colorPicker'));
new AsideController();

if (history.scrollRestoration) history.scrollRestoration = 'manual';

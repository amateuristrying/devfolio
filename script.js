// ===============================
// INITIAL STATE
// ===============================

// Keep strip hidden above screen
gsap.set("#shadowPanel", { y: "-75px" });


// ===============================
// GSAP DECODE HOVER EFFECT
// ===============================
function setupDecodeEffect(element, duration = 0.35) {
    if (!element) return;
    const originalText = element.getAttribute("data-original-text") || element.innerText.trim();
    element.setAttribute("data-original-text", originalText);

    const chars = "!<>-_\\/[]{}—=+*^?#_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let tween = null;

    element.addEventListener("mouseenter", () => {
        if (tween) tween.kill();

        const progressObj = { value: 0 };
        const length = originalText.length;

        tween = gsap.to(progressObj, {
            value: length,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                const currentProgress = progressObj.value;
                let output = "";
                for (let i = 0; i < length; i++) {
                    const originalChar = originalText[i];
                    if (originalChar === " ") {
                        output += " ";
                    } else if (i < Math.floor(currentProgress)) {
                        output += originalChar;
                    } else {
                        output += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                element.innerText = output;
            },
            onComplete: () => {
                element.innerText = originalText;
            }
        });
    });

    element.addEventListener("mouseleave", () => {
        if (tween && tween.isActive()) {
            tween.timeScale(2.5);
        } else {
            element.innerText = originalText;
        }
    });
}

const knowMoreBtn = document.getElementById("knowMoreBtn");
setupDecodeEffect(knowMoreBtn);

const heroName = document.getElementById("heroName");
if (heroName) {
    setupDecodeEffect(heroName, 0.4);
}


// ===============================
// HERO ENTRANCE TEXT ANIMATION (ON SITE OPEN)
// ===============================
function runHeroEntranceAnimation() {
    const heroContent = document.querySelector(".page1-content");
    const prefixEl = document.getElementById("heroPrefix");
    const nameEl = document.getElementById("heroName");
    const subEl = document.getElementById("heroSub");

    if (!heroContent || !prefixEl || !nameEl || !subEl) return;

    const prefixText = "Hi there, I am ";
    const nameText = "Abhiroop";
    const subText = "I help startups and companies build market-viable products.";
    const chars = "!<>-_\\/[]{}—=+*^?#_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Smooth container fade and rise
    gsap.fromTo(heroContent,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }
    );

    function decodeTextReveal(el, targetText, duration, delay) {
        const obj = { progress: 0 };
        const len = targetText.length;

        // Start with scrambled glyphs
        el.textContent = targetText.replace(/[^\s]/g, () => chars[Math.floor(Math.random() * chars.length)]);

        return gsap.to(obj, {
            progress: len,
            duration: duration,
            delay: delay,
            ease: "power2.out",
            onUpdate: () => {
                const current = obj.progress;
                let res = "";
                for (let i = 0; i < len; i++) {
                    const char = targetText[i];
                    if (char === " ") {
                        res += " ";
                    } else if (i < Math.floor(current)) {
                        res += char;
                    } else {
                        res += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                el.textContent = res;
            },
            onComplete: () => {
                el.textContent = targetText;
                el.setAttribute("data-original-text", targetText);
            }
        });
    }

    // Sequenced decode animation
    decodeTextReveal(prefixEl, prefixText, 0.6, 0.15);
    decodeTextReveal(nameEl, nameText, 0.5, 0.45);
    decodeTextReveal(subEl, subText, 0.8, 0.65);
}

// Run hero animation on page open
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runHeroEntranceAnimation);
} else {
    runHeroEntranceAnimation();
}


// ===============================
// OPEN KNOW MORE PAGE
// ===============================
knowMoreBtn.addEventListener("click", () => {

    // Hide KNOW MORE button
    knowMoreBtn.style.display = "none";

    // Create iframe
    const frame = document.createElement("iframe");
    frame.src = "knowmore.html";
    frame.id = "page2frame";
    document.body.appendChild(frame);

    const strip = document.getElementById("shadowPanel");

    // Initial positions
    gsap.set(strip, { y: "-75px" });
    gsap.set(frame, { y: "-120vh" });

    // Timeline
    const tl = gsap.timeline({
        defaults: { ease: "power4.inOut" }
    });

    // 1. Black strip falls down
    tl.to(strip, {
        y: "150vh",
        duration: 1.3
    })

    // 2. Page follows behind the strip
    .to(frame, {
        y: "0vh",
        duration: 0.7
    }, "-=1.0")

    // 3. 🔥 Trigger text animation WHILE strip crosses text
    .add(() => {
        frame.contentWindow.postMessage("startTextAnim", "*");
    }, "-=0.55"); // <-- fine-tuned sync point
});


// ===============================
// CLOSE KNOW MORE PAGE
// ===============================
window.addEventListener("message", (event) => {
    if (event.data !== "goHome") return;

    const frame = document.getElementById("page2frame");
    if (!frame) return;

    const strip = document.getElementById("shadowPanel");

    // Set start positions
    gsap.set(strip, { y: "150vh" });
    gsap.set(frame, { y: "0vh" });

    const tl = gsap.timeline({
        defaults: { ease: "power4.inOut" }
    });

    // 1. Strip rises upward
    tl.to(strip, {
        y: "-75px",
        duration: 1.0
    })

    // 2. Page exits behind strip
    .to(frame, {
        y: "-120vh",
        duration: 0.8
    }, "-=0.75")

    // 3. Cleanup
    .add(() => {
        frame.remove();
        knowMoreBtn.style.display = "block";
        knowMoreBtn.innerText = knowMoreBtn.getAttribute("data-original-text") || "Know More ↓";
        gsap.set(strip, { y: "-75px" });
    });
});

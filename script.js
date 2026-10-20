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

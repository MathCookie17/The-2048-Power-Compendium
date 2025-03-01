for (let c of document.getElementsByClassName("customGuide_exampleReveal")) {
    c.addEventListener("click", function(){
        let d = c.parentElement;
        d = d.children[d.children.length - 1];
        if (getComputedStyle(d).getPropertyValue("display") == "none") {
            d.style.setProperty("display", "block");
            c.innerHTML = "Hide Save Code";
        }
        else {
            d.style.setProperty("display", "none");
            c.innerHTML = "Show Save Code";
        }
    })
};

document.documentElement.style.setProperty("background-image", "radial-gradient(#520064, #d600e9)");
document.getElementById("guide").style.setProperty("color", "#f7a1ff")
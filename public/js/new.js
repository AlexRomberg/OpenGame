$(".list img").click((sender) => {
    window.location.href = "/new?game=" + sender.target.id;
});
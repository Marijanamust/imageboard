console.log("sainty");

(function() {
    Vue.component("image-modal", {
        template: "#image-modal-template",
        props: ["image_id"],
        watch: {
            image_id: function() {
                var me = this;
                axios
                    .get("/imagedata/" + this.image_id)
                    .then(function(response) {
                        if (response.data[0].length == 0) {
                            me.closeModal();
                        } else {
                            me.image = response.data[0][0];
                            me.comments = response.data[1];
                            me.image.created_at = parseDate(
                                response.data[0][0].created_at
                            );

                            me.comments.map(function(comment) {
                                comment.created_at = parseDate(
                                    comment.created_at
                                );
                            });
                            me.showErrorMod = false;
                            if (!me.image.nextid) {
                                me.showNext = false;
                            } else {
                                me.showNext = true;
                            }
                            if (!me.image.previd) {
                                me.showPrev = false;
                            } else {
                                me.showPrev = true;
                            }
                        }
                    });
            }
        },
        data: function() {
            return {
                image: {},
                form: { comment: "", username: "" },
                comments: [],
                showNext: true,
                showPrev: true,
                showSure: false
            };
        },

        mounted: function() {
            var me = this;
            axios.get("/imagedata/" + this.image_id).then(function(response) {
                if (response.data[0].length == 0) {
                    console.log(response.data[0]);
                    me.closeModal();
                } else {
                    me.image = response.data[0][0];
                    me.comments = response.data[1];
                    me.image.created_at = parseDate(
                        response.data[0][0].created_at
                    );
                    me.comments.map(function(comment) {
                        comment.created_at = parseDate(comment.created_at);
                    });

                    if (!me.image.nextid) {
                        me.showNext = false;
                    } else {
                        me.showNext = true;
                    }
                    if (!me.image.previd) {
                        me.showPrev = false;
                    } else {
                        me.showPrev = true;
                    }
                }
            });
        },
        methods: {
            closeModal: function() {
                this.$emit("close");
            },
            postcomment: function(e) {
                e.preventDefault();
                var data = {
                    comment: this.form.comment,
                    username: this.form.username,
                    image_id: this.image.id
                };
                var me = this;
                axios
                    .post("/comments", data)
                    .then(function(response) {
                        var comment = response.data[0];
                        me.comments.unshift(comment);
                        me.comments[0].created_at = parseDate(
                            response.data[0].created_at
                        );
                        me.form.comment = "";
                        me.form.username = "";
                    })
                    .catch(error => {
                        console.log("error in post", error);
                    });
            },
            deletePicOnChild: function() {
                this.$emit("deletepic");
            },
            showPrevFunc: function() {
                location.hash = "#" + this.image.previd;
            },
            showNextFunc: function() {
                location.hash = "#" + this.image.nextid;
            },
            closeSureFunc: function() {
                this.showSure = false;
            },
            showSureFunc: function() {
                this.showSure = true;
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            showButton: true,
            images: [],
            image_id: location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            showError: false
        },
        mounted: function() {
            var me = this;
            addEventListener("hashchange", () => {
                if (
                    location.hash.slice(1) != "" &&
                    !isNaN(location.hash.slice(1))
                ) {
                    this.image_id = location.hash.slice(1);
                } else {
                    this.closeModalOnParent();
                }
            });

            axios.get("/images").then(function(response) {
                me.images = response.data;
            });
        },
        methods: {
            closeModalOnParent: function() {
                location.hash = "";
                this.image_id = "";
                this.showError = false;
            },

            handleClick: function(e) {
                e.preventDefault();

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;

                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        var img = {
                            title: response.data[0].title,
                            username: response.data[0].username,
                            description: response.data[0].description,
                            url: response.data[0].url,
                            id: response.data[0].id
                        };
                        me.images.unshift(img);
                        me.title = "";
                        me.description = "";
                        me.username = "";
                        me.file = null;
                        me.showError = false;
                    })
                    .catch(error => {
                        console.log("error in post", error);
                        me.showError = true;
                    });
            },
            handleChange: function(e) {
                this.file = e.target.files[0];
            },
            moreimages: function(e) {
                e.preventDefault();

                var currLowestId = this.images[this.images.length - 1].id;
                var me = this;
                axios
                    .get("/moreimages/" + currLowestId)
                    .then(function(response) {
                        me.images.push(...response.data);
                        var currLowestId = me.images[me.images.length - 1].id;
                        var genLowestId = response.data[0].lowestId;

                        if (currLowestId == genLowestId) {
                            me.showButton = false;
                        }
                    });
            },
            deletePicOnParent: function() {
                var me = this;

                axios
                    .get("/delete/" + location.hash.slice(1))
                    .then(() => {
                        me.images = me.images.filter(function(image) {
                            return image.id != me.image_id;
                        });
                        me.closeModalOnParent();
                    })
                    .catch(error => {
                        console.log("error in delete", error);
                    });
            }
        }
    });

    function parseDate(created_at) {
        var date = new Date(Date.parse(created_at));
        var user_date = new Date();
        var diff = Math.floor((user_date - date) / 1000);
        if (diff <= 1) {
            return "just now";
        }
        if (diff < 20) {
            return diff + " seconds ago";
        }
        if (diff < 40) {
            return "half a minute ago";
        }
        if (diff < 60) {
            return "less than a minute ago";
        }
        if (diff <= 90) {
            return "one minute ago";
        }
        if (diff <= 3540) {
            return Math.round(diff / 60) + " minutes ago";
        }
        if (diff <= 5400) {
            return "1 hour ago";
        }
        if (diff <= 86400) {
            return Math.round(diff / 3600) + " hours ago";
        }
        if (diff <= 129600) {
            return "1 day ago";
        }
        if (diff < 604800) {
            return Math.round(diff / 86400) + " days ago";
        }
        if (diff <= 777600) {
            return "1 week ago";
        }
        return (
            "on " +
            date.getDate() +
            "/" +
            date.getMonth() +
            "/" +
            date.getFullYear()
        );
    }
})();

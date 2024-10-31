document.addEventListener('DOMContentLoaded', function() {
    // Load stored interactions from localStorage
    const interactions = JSON.parse(localStorage.getItem('blogInteractions') || '{}');

    // Setup interaction buttons for each post
    document.querySelectorAll('.post-card').forEach(card => {
        const postId = card.dataset.postId;
        const likeBtn = card.querySelector('.like-btn');
        const dislikeBtn = card.querySelector('.dislike-btn');
        const likeCount = card.querySelector('.like-count');
        const dislikeCount = card.querySelector('.dislike-count');

        // Initialize counts
        const postInteractions = interactions[postId] || { likes: 0, dislikes: 0, userChoice: null };
        likeCount.textContent = postInteractions.likes;
        dislikeCount.textContent = postInteractions.dislikes;

        // Set initial button states
        if (postInteractions.userChoice === 'like') {
            likeBtn.classList.add('active');
        } else if (postInteractions.userChoice === 'dislike') {
            dislikeBtn.classList.add('active');
        }

        // Like button handler
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (postInteractions.userChoice === 'like') {
                // Unlike
                postInteractions.likes--;
                postInteractions.userChoice = null;
                likeBtn.classList.remove('active');
            } else {
                // Like
                if (postInteractions.userChoice === 'dislike') {
                    postInteractions.dislikes--;
                    dislikeBtn.classList.remove('active');
                }
                postInteractions.likes++;
                postInteractions.userChoice = 'like';
                likeBtn.classList.add('active');
            }

            // Update UI
            likeCount.textContent = postInteractions.likes;
            dislikeCount.textContent = postInteractions.dislikes;

            // Save to localStorage
            interactions[postId] = postInteractions;
            localStorage.setItem('blogInteractions', JSON.stringify(interactions));
        });

        // Dislike button handler
        dislikeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (postInteractions.userChoice === 'dislike') {
                // Remove dislike
                postInteractions.dislikes--;
                postInteractions.userChoice = null;
                dislikeBtn.classList.remove('active');
            } else {
                // Dislike
                if (postInteractions.userChoice === 'like') {
                    postInteractions.likes--;
                    likeBtn.classList.remove('active');
                }
                postInteractions.dislikes++;
                postInteractions.userChoice = 'dislike';
                dislikeBtn.classList.add('active');
            }

            // Update UI
            likeCount.textContent = postInteractions.dislikes;
            dislikeCount.textContent = postInteractions.dislikes;

            // Save to localStorage
            interactions[postId] = postInteractions;
            localStorage.setItem('blogInteractions', JSON.stringify(interactions));
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const recordsContainer = document.getElementById('recordsContainer');

    // Fetch real data from your backend
    fetch('http://localhost:3000/api/members')
        .then(response => response.json())
        .then(data => populateRecords(data))
        .catch(error => console.error('Error fetching members:', error));

    function populateRecords(members) {
        recordsContainer.innerHTML = members.map(member => `
            <div class="record-item">
                <div class="record-summary">
                    <div class="record-image">
                        <img src="${member.profileImage || 'default-avatar.png'}" alt="Profile">
                    </div>
                    <span class="name">${member.memberName}</span>
                    <span class="email">${member.email}</span>
                    <span class="phone">${member.phone}</span>
                    <span class="actions">
                        <button class="btn-details">View Details</button>
                    </span>
                </div>
                <div class="record-details">
                    <div class="detail-row">
                        <span class="detail-label">Registration Date:</span>
                        <span class="detail-content">${new Date(member.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Business Details:</span>
                        <span class="detail-content">${member.businessDetails || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.record-item').forEach(item => {
            const details = item.querySelector('.record-details');
            const btn = item.querySelector('.btn-details');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDetails(item);
            });

            item.addEventListener('click', () => {
                toggleDetails(item);
            });
        });
    }

    function toggleDetails(item) {
        const details = item.querySelector('.record-details');
        const isActive = details.classList.contains('active');

        // Close all details
        document.querySelectorAll('.record-details').forEach(d => {
            d.classList.remove('active');
        });

        // Toggle current if not active
        if (!isActive) {
            details.classList.add('active');
        }
    }
});

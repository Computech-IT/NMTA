document.addEventListener('DOMContentLoaded', () => {
    const recordsContainer = document.getElementById('recordsContainer');
    
    // Sample data (replace with actual API call)
    app.get('/members', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM members');
            res.json(rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Failed to fetch members' });
        }
    });
    ];

    // Fetch real data from your backend
    
    fetch('http://localhost:3000/members')
        .then(response => response.json())
        .then(data => populateRecords(data))
        .catch(error => console.error('Error:', error));
    
    function populateRecords(members) {
        recordsContainer.innerHTML = members.map(member => `
            <div class="record-item">
                <div class="record-summary">
                    <span class="name">${member.name}</span>
                    <span class="email">${member.email}</span>
                    <span class="phone">${member.phone}</span>
                    <span class="actions">
                        <button class="btn-details">View Details</button>
                    </span>
                </div>
                <div class="record-details">
                    <div class="detail-row">
                        <span class="detail-label">Registration Date:</span>
                        <span class="detail-content">${member.registrationDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Business Details:</span>
                        <span class="detail-content">${member.businessDetails}</span>
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

    // Initial population with sample data
    populateRecords(members);
});
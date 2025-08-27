// Simple persistent database for development
const fs = require('fs');
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const THEMES_FILE = path.join(DB_DIR, 'themes.json');
const POSTS_FILE = path.join(DB_DIR, 'posts.json');
const TOKENS_FILE = path.join(DB_DIR, 'tokens.json');
const NOTIFICATIONS_FILE = path.join(DB_DIR, 'notifications.json');
const FAVORITES_FILE = path.join(DB_DIR, 'favorites.json');
const COURSE_SCHEDULES_FILE = path.join(DB_DIR, 'courseSchedules.json');
const LOTTERY_FILE = path.join(DB_DIR, 'lottery.json');
const NEWS_FILE = path.join(DB_DIR, 'news.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Load data from files or create default data
function loadData(filePath, defaultValue) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);

            // Special handling for courseSchedules - convert array to Map
            if (filePath === COURSE_SCHEDULES_FILE && Array.isArray(parsedData)) {
                const courseMap = new Map();
                parsedData.forEach(schedule => {
                    courseMap.set(schedule._id, schedule);
                });
                return courseMap;
            }

            return new Map(parsedData);
        }
    } catch (error) {
        console.error(`Error loading data from ${filePath}:`, error);
    }
    return new Map(defaultValue);
}

// Save data to files
function saveData(filePath, data) {
    try {
        let serializedData;

        // Special handling for courseSchedules - convert Map back to array
        if (filePath === COURSE_SCHEDULES_FILE) {
            serializedData = JSON.stringify(Array.from(data.values()));
        } else {
            serializedData = JSON.stringify(Array.from(data.entries()));
        }

        fs.writeFileSync(filePath, serializedData, 'utf8');
    } catch (error) {
        console.error(`Error saving data to ${filePath}:`, error);
    }
}

// Initialize database with persistent storage
const users = loadData(USERS_FILE, []);
const themes = loadData(THEMES_FILE, []);
const posts = loadData(POSTS_FILE, []);
const tokens = loadData(TOKENS_FILE, []);
const notifications = loadData(NOTIFICATIONS_FILE, []);
const favorites = loadData(FAVORITES_FILE, []);
const courseSchedules = loadData(COURSE_SCHEDULES_FILE, []);
const lottery = loadData(LOTTERY_FILE, []);
const news = loadData(NEWS_FILE, []);

// Add sample data only if database is empty
if (users.size === 0) {
    const sampleUserId = "1";
    const sampleUser = {
        _id: sampleUserId,
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        posts: [],
        themes: [],
        favorites: [],
        role: 'user',
        created_at: new Date()
    };

    // Add an admin user
    const adminUserId = "2";
    const adminUser = {
        _id: adminUserId,
        email: "admin@example.com",
        username: "admin",
        password: "admin123",
        posts: [],
        themes: [],
        favorites: [],
        role: 'admin',
        created_at: new Date()
    };

    users.set(adminUserId, adminUser);
    users.set(sampleUserId, sampleUser);

    const sampleThemeId = "1";
    const sampleTheme = {
        _id: sampleThemeId,
        title: "Спагети Карбонара",
        category: "Паста",
        img: "assets/logo.jpg",
        time: 30,
        ingredients: "Спагети, яйца, бекон, пармезан, черен пипер",
        text: "1. Варете спагетите според инструкциите на опаковката. 2. Изпържете бекона до хрупкаво. 3. Разбийте яйцата в купа. 4. Смесете спагетите с яйцата и бекона. 5. Поръснете с пармезан и черен пипер.",
        userId: sampleUserId,
        subscribers: [],
        ratings: [
            { rating: 4, userId: sampleUserId, username: "testuser" },
            { rating: 5, userId: sampleUserId, username: "testuser" }
        ],
        comments: [],
        averageRating: 4.5,
        totalRatings: 2,
        created_at: new Date()
    };
    themes.set(sampleThemeId, sampleTheme);

    const sampleThemeId2 = "2";
    const sampleTheme2 = {
        _id: sampleThemeId2,
        title: "Пица Маргарита",
        category: "Пица",
        img: "assets/logo.jpg",
        time: 45,
        ingredients: "Тесто за пица, домати, моцарела, босилек, зехтин",
        text: "1. Разточете тестото за пица. 2. Намажете с доматен сос. 3. Добавете моцарелата. 4. Печете на 220°C за 15-20 минути. 5. Поръснете с босилек и зехтин.",
        userId: sampleUserId,
        subscribers: [],
        ratings: [
            { rating: 5, userId: sampleUserId, username: "testuser" }
        ],
        comments: [],
        averageRating: 5.0,
        totalRatings: 1,
        created_at: new Date()
    };
    themes.set(sampleThemeId2, sampleTheme2);

    const sampleThemeId3 = "3";
    const sampleTheme3 = {
        _id: sampleThemeId3,
        title: "Шопска Салата",
        category: "Салата",
        img: "assets/logo.jpg",
        time: 15,
        ingredients: "Домати, краставици, лук, сирене, зехтин, оцет",
        text: "1. Нарежете доматите на кубчета. 2. Нарежете краставиците на кръгчета. 3. Нарежете лука на фини пръстени. 4. Натрошете сиренето. 5. Смесете всички съставки и поръснете с зехтин и оцет.",
        userId: sampleUserId,
        subscribers: [],
        ratings: [
            { rating: 4, userId: sampleUserId, username: "testuser" },
            { rating: 4, userId: sampleUserId, username: "testuser" },
            { rating: 5, userId: sampleUserId, username: "testuser" }
        ],
        comments: [],
        averageRating: 4.3,
        totalRatings: 3,
        created_at: new Date()
    };
    themes.set(sampleThemeId3, sampleTheme3);

    // Add sample news data
    const sampleNews1 = {
        _id: "1",
        title: "Добре дошли в нашата общност за рецепти!",
        summary: "Открийте невероятни рецепти и споделете вашите кулинарни творения с нашата растяща общност.",
        content: "Радваме се да ви приветстваме в нашата общност за рецепти! Тук можете да откриете невероятни рецепти от цял свят, да споделите собствени кулинарни творения и да се свържете с други ентусиасти по готвене. Независимо дали сте опитен готвач или просто започвате своето кулинарно пътуване, тук има нещо за всеки.",
        author: {
            _id: "2",
            username: "admin"
        },
        status: "published",
        tags: ["добре дошли", "общност", "рецепти"],
        created_at: new Date(),
        published_at: new Date(),
        views: 150,
        featured: true
    };

    const sampleNews2 = {
        _id: "2",
        title: "Нови сезонни рецепти",
        summary: "Открийте най-новите рецепти за този сезон",
        content: "Този сезон ви предлагаме множество вкусни рецепти, които ще ви помогнат да приготвите невероятни ястия. От супи до десерти, имаме всичко което трябва за перфектната трапеза. Нашите готвачи са подготвили специални менюта, които включват най-свежите сезонни продукти.",
        author: {
            _id: "2",
            username: "admin"
        },
        status: "published",
        tags: ["сезонни", "нови рецепти"],
        created_at: new Date('2024-01-10'),
        published_at: new Date('2024-01-10'),
        views: 89,
        featured: false
    };

    const sampleNews3 = {
        _id: "3",
        title: "Как да приготвим перфектна паста",
        summary: "Секретите на италианската кухня",
        content: "Пастата е едно от най-популярните ястия в света. В тази статия ще научите как да приготвите перфектна паста вкъщи. Ще разгледаме различните видове паста, как да изберем правилните сосове и как да комбинираме вкусовете за незабравимо ястие.",
        author: {
            _id: "2",
            username: "admin"
        },
        status: "published",
        tags: ["паста", "италианска кухня"],
        created_at: new Date('2024-01-05'),
        published_at: new Date('2024-01-05'),
        views: 234,
        featured: true
    };

    news.set("1", sampleNews1);
    news.set("2", sampleNews2);
    news.set("3", sampleNews3);

    // Save initial data
    saveData(USERS_FILE, users);
    saveData(THEMES_FILE, themes);
    saveData(POSTS_FILE, posts);
    saveData(TOKENS_FILE, tokens);
    saveData(NOTIFICATIONS_FILE, notifications);
    saveData(FAVORITES_FILE, favorites);
    saveData(COURSE_SCHEDULES_FILE, courseSchedules);
    saveData(LOTTERY_FILE, lottery);
    saveData(NEWS_FILE, news);
}

// Enhanced save functions that persist data
function saveUsers() {
    saveData(USERS_FILE, users);
}

function saveThemes() {
    saveData(THEMES_FILE, themes);
}

function savePosts() {
    saveData(POSTS_FILE, posts);
}

function saveTokens() {
    saveData(TOKENS_FILE, tokens);
}

function saveNotifications() {
    saveData(NOTIFICATIONS_FILE, notifications);
}

function saveFavorites() {
    saveData(FAVORITES_FILE, favorites);
}

function saveCourseSchedules() {
    saveData(COURSE_SCHEDULES_FILE, courseSchedules);
}

function saveLottery() {
    saveData(LOTTERY_FILE, lottery);
}

function saveNews() {
    saveData(NEWS_FILE, news);
}

// Auto-save on process exit
process.on('SIGINT', () => {
    console.log('Saving database before exit...');
    saveUsers();
    saveThemes();
    savePosts();
    saveTokens();
    saveNotifications();
    saveFavorites();
    saveCourseSchedules();
    saveLottery();
    saveNews();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Saving database before exit...');
    saveUsers();
    saveThemes();
    savePosts();
    saveTokens();
    saveNotifications();
    saveFavorites();
    saveCourseSchedules();
    saveLottery();
    saveNews();
    process.exit(0);
});

module.exports = {
    users,
    themes,
    posts,
    tokens,
    notifications,
    favorites,
    courseSchedules,
    lottery,
    news,
    saveUsers,
    saveThemes,
    savePosts,
    saveTokens,
    saveNotifications,
    saveFavorites,
    saveCourseSchedules,
    saveLottery,
    saveNews
}; 
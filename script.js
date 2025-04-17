// DOM 요소 가져오기
const scrollTopBtn = document.getElementById('scrollTopBtn');
const searchBox = document.getElementById('search-box');
const softwareItems = document.querySelectorAll('.software-item');
const filterButtons = document.querySelectorAll('.filter-button');
const categories = document.querySelectorAll('.category');

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 다크모드 토글 버튼 생성
    createDarkModeToggle();
});

// 다크모드 토글 버튼 생성
const createDarkModeToggle = () => {
    const toggle = document.createElement('button');
    toggle.classList.add('dark-mode-toggle');
    toggle.innerHTML = '☀️';
    toggle.title = '다크모드 전환';
    document.body.appendChild(toggle);

    // 저장된 사용자 환경설정 확인
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '🌙';
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggle.innerHTML = isDark ? '🌙' : '☀️';
        localStorage.setItem('darkMode', isDark);
    });
};

// 스크롤 탑 버튼 기능
window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
});

// 텍스트에서 검색어를 하이라이트하는 함수
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    // 정규표현식을 사용하여 대소문자 구분 없이 검색
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 원본 텍스트 저장용 객체
const originalTexts = {};

// 페이지 초기화 시 모든 원본 텍스트 저장
softwareItems.forEach((item, index) => {
    const nameElement = item.querySelector('.software-name');
    const descElement = item.querySelector('.software-description');
    
    originalTexts[`name_${index}`] = nameElement.textContent;
    originalTexts[`desc_${index}`] = descElement.textContent;
});

// 향상된 검색 기능 - 부분 일치 검색
searchBox.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    let hasVisibleItems = false;
    
    // 각 카테고리별 보이는 항목 수 추적
    const visibleItemsInCategory = {};
    
    categories.forEach(category => {
        const categoryId = category.getAttribute('data-category');
        visibleItemsInCategory[categoryId] = 0;
    });
    
    softwareItems.forEach((item, index) => {
        const nameElement = item.querySelector('.software-name');
        const descElement = item.querySelector('.software-description');
        
        // 원본 텍스트 가져오기
        const originalName = originalTexts[`name_${index}`];
        const originalDesc = originalTexts[`desc_${index}`];
        
        // 검색어가 비어있으면 모든 항목 표시
        if (!searchTerm) {
            item.style.display = '';
            nameElement.innerHTML = originalName;
            descElement.innerHTML = originalDesc;
            
            // 카테고리에 표시되는 항목 개수 증가
            const category = item.closest('.category');
            const categoryId = category.getAttribute('data-category');
            visibleItemsInCategory[categoryId]++;
            hasVisibleItems = true;
            return;
        }
        
        // 이름과 설명에서 검색어 확인 (부분 일치도 포함)
        const nameMatch = originalName.toLowerCase().includes(searchTerm);
        const descMatch = originalDesc.toLowerCase().includes(searchTerm);
        
        if (nameMatch || descMatch) {
            item.style.display = '';
            
            // 검색어 하이라이트 처리
            nameElement.innerHTML = highlightText(originalName, searchTerm);
            descElement.innerHTML = highlightText(originalDesc, searchTerm);
            
            // 카테고리에 표시되는 항목 개수 증가
            const category = item.closest('.category');
            const categoryId = category.getAttribute('data-category');
            visibleItemsInCategory[categoryId]++;
            hasVisibleItems = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 각 카테고리의 표시 여부 업데이트
    categories.forEach(category => {
        const categoryId = category.getAttribute('data-category');
        if (visibleItemsInCategory[categoryId] > 0) {
            category.style.display = '';
        } else {
            category.style.display = 'none';
        }
    });
    
    // 검색 결과가 없을 경우 메시지 표시
    const noResultsMsg = document.getElementById('no-results-message');
    if (!hasVisibleItems && searchTerm) {
        if (!noResultsMsg) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.classList.add('no-results');
            message.innerHTML = `"${searchTerm}"에 대한 검색 결과가 없습니다.`;
            document.querySelector('#search-container').appendChild(message);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
});

// 필터 버튼 기능
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 버튼 활성화 상태 변경
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-category');
        
        // 검색창 초기화
        searchBox.value = '';
        
        // 하이라이트 제거
        softwareItems.forEach((item, index) => {
            const nameElement = item.querySelector('.software-name');
            const descElement = item.querySelector('.software-description');
            
            nameElement.innerHTML = originalTexts[`name_${index}`];
            descElement.innerHTML = originalTexts[`desc_${index}`];
            item.style.display = '';
        });
        
        // 카테고리 필터링
        if (filter === 'all') {
            categories.forEach(category => {
                category.style.display = '';
            });
        } else {
            categories.forEach(category => {
                if (category.getAttribute('data-category') === filter) {
                    category.style.display = '';
                } else {
                    category.style.display = 'none';
                }
            });
        }
        
        // 검색 결과 없음 메시지 제거
        const noResultsMsg = document.getElementById('no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    });
});

// 소프트웨어 항목 애니메이션
softwareItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-5px)';
        item.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = '';
        item.style.boxShadow = '';
    });
});

// 카테고리를 클릭하면 해당 카테고리의 제목을 접고 펼치는 기능
categories.forEach(category => {
    const title = category.querySelector('h2');
    const softwareList = category.querySelector('.software-list');
    
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
        softwareList.style.display = softwareList.style.display === 'none' ? '' : 'none';
        title.classList.toggle('collapsed');
    });
});


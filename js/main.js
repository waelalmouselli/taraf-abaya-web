document.addEventListener('DOMContentLoaded', function() {
    
    /* --- 1. القائمة المتجاوبة (Hamburger Menu) --- */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    /* --- 2. زر العودة إلى الأعلى --- */
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* --- 3. النظام الديناميكي للمنتجات (استدعاء من ملف JSON من داخل مجلد js) --- */
    fetch('js/products.json?v=' + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            const abayasGrid = document.getElementById('abayasGrid');
            const productDetailsContainer = document.getElementById('productDetailsContainer');
            const loadMoreContainer = document.getElementById('loadMoreContainer');

            if (abayasGrid || productDetailsContainer) {

                // أ) صفحة جميع العبايات (all-abayas.html أو الرابط النظيف all-abayas) - عرض كل المنتجات دفعة واحدة
                if (abayasGrid && window.location.pathname.includes('all-abayas')) {
                    renderAbayasGrid(products, abayasGrid);
                    if (loadMoreContainer) {
                        loadMoreContainer.style.display = 'none'; // إخفاء حاوية الزر تماماً
                    }
                }

                // ب) الصفحة الرئيسية (index.html) - عرض أول 4 منتجات فقط
                else if (abayasGrid && !productDetailsContainer) {
                    renderAbayasGrid(products.slice(0, 4), abayasGrid);
                }

                // ج) صفحة تفاصيل المنتج (product.html)
                if (productDetailsContainer) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const skuParam = urlParams.get('sku');
                    const product = products.find(p => p.sku === skuParam);

                    if (product) {
                        document.title = `${product.name} (${product.sku}) | ترف ستايل للعبايات`;
                        
                        let canonicalTag = document.querySelector("link[rel='canonical']");
                        if (canonicalTag) {
                            canonicalTag.href = `https://tarafstyleabaya.com/product.html?sku=${product.sku}`;
                        }

                        productDetailsContainer.innerHTML = `
                            <div class="product-gallery">
                                <img src="${product.img}" alt="${product.name}" loading="lazy">
                            </div>

                            <div class="product-info-content">
                                <span class="sku">رمز الكود: ${product.sku}</span>
                                <h1>${product.name}</h1>
                                <p class="price">${product.price}</p>
                                <p class="description">${product.description}</p>

                                <div class="options-group">
                                    <label for="sizeSelect">اختر المقاس (الطول بالإنش):</label>
                                    <select id="sizeSelect">
                                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                    </select>
                                    <a href="size-guide.html" target="_blank" class="size-guide-link-text">عرض جدول المقاسات وطريقة القياس بالتفصيل &larr;</a>
                                </div>

                                <div class="product-actions">
                                    <a href="#" id="whatsappOrderBtn" target="_blank" class="btn-whatsapp" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <span>&#128222;</span> اطلب العباية الآن عبر الواتساب
                                    </a>
                                </div>
                            </div>
                        `;

                        const cleanPrice = product.price.replace(/[^\d]/g, '');
                        const dynamicSchema = {
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": product.name,
                            "image": `https://tarafstyleabaya.com/${product.img}`,
                            "description": product.description,
                            "sku": product.sku,
                            "brand": {
                                "@type": "Brand",
                                "name": "ترف ستايل للعبايات"
                            },
                            "offers": {
                                "@type": "Offer",
                                "priceCurrency": "AED",
                                "price": cleanPrice,
                                "itemCondition": "https://schema.org/NewCondition",
                                "availability": "https://schema.org/InStock",
                                "areaServed": "AE",
                                "url": `https://tarafstyleabaya.com/product.html?sku=${product.sku}`
                            }
                        };

                        const existingScript = document.getElementById('dynamicProductSchema');
                        if (existingScript) existingScript.remove();

                        const scriptTag = document.createElement('script');
                        scriptTag.id = 'dynamicProductSchema';
                        scriptTag.type = 'application/ld+json';
                        scriptTag.text = JSON.stringify(dynamicSchema);
                        document.head.appendChild(scriptTag);

                        const sizeSelect = document.getElementById('sizeSelect');
                        const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');

                        function updateWhatsappLink() {
                            const selectedSize = sizeSelect.value;
                            const encodedText = encodeURIComponent(`مرحباً، أود طلب ${product.name} - الكود: ${product.sku} بالمقاس: ${selectedSize}`);
                            whatsappOrderBtn.href = `https://wa.me/971569275283?text=${encodedText}`;
                        }

                        sizeSelect.addEventListener('change', updateWhatsappLink);
                        updateWhatsappLink();

                    } else {
                        productDetailsContainer.innerHTML = `
                            <div style="grid-column: span 2; text-align: center; padding: 3rem;">
                                <h2 style="color: var(--accent-gold); margin-bottom: 1rem;">عذراً، المنتج غير موجود</h2>
                                <a href="index.html" class="btn-primary" style="display: inline-block; padding: 0.6rem 1.5rem;">العودة إلى الرئيسية</a>
                            </div>
                        `;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error Loading Products:', error);
            const container = document.getElementById('abayasGrid');
            if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:var(--accent-gold); margin-top: 2rem;">عذراً، حدث خطأ في تحميل المنتجات. يرجى التأكد من أن ملف المنتجات موجود بشكل صحيح.</p>';
        });

    function renderAbayasGrid(items, container) {
        container.innerHTML = items.map(product => createCardHTML(product)).join('');
    }

    function createCardHTML(product) {
        return `
            <div class="abaya-card">
                <img src="${product.img}" alt="${product.name}" class="abaya-img" loading="lazy">
                <div class="abaya-info">
                    <span class="abaya-sku">رمز الكود: ${product.sku}</span>
                    <h3 class="abaya-name">${product.name}</h3>
                    <p class="abaya-price">${product.price}</p>
                    <div class="abaya-actions">
                        <a href="product.html?sku=${product.sku}" class="btn-primary btn-details">تفاصيل العباية</a>
                        <a href="https://wa.me/971569275283?text=${encodeURIComponent('مرحباً، أود طلب ' + product.name + ' - الكود: ' + product.sku)}" target="_blank" class="btn-whatsapp">واتساب</a>
                    </div>
                </div>
            </div>
        `;
    }
});

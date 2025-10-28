(function () {
	const canvas = document.getElementById("cardBgEffect"),
		ctx = canvas.getContext("2d");
	function resize() {
		canvas.width = canvas.parentElement.offsetWidth;
		canvas.height = canvas.parentElement.offsetHeight;
	}
	resize();
	window.addEventListener("resize", resize);
	const particles = [],
		particleCount = 50;
	for (let i = 0; i < particleCount; i++) {
		particles.push({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			radius: Math.random() * 2 + 1,
			vx: Math.random() * 2 - 1,
			vy: Math.random() * 2 - 1,
			color: `rgba(0, ${Math.floor(Math.random() * 150 + 150)}, ${Math.floor(
				Math.random() * 100 + 180
			)}, 0.7)`
		});
	}
	function animate() {
		requestAnimationFrame(animate);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i < particleCount; i++) {
			const p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
			if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
			const gradient = ctx.createRadialGradient(
				p.x,
				p.y,
				0,
				p.x,
				p.y,
				p.radius * 2
			);
			gradient.addColorStop(0, "rgba(255,255,255,1)");
			gradient.addColorStop(1, "rgba(255,255,255,0)");
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
			ctx.fill();
			for (let j = i + 1; j < particleCount; j++) {
				const p2 = particles[j],
					distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
				if (distance < 100) {
					ctx.beginPath();
					ctx.strokeStyle = `rgba(0, 220, 180, ${0.1 * (1 - distance / 100)})`;
					ctx.lineWidth = 0.5;
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.stroke();
				}
			}
		}
	}
	animate();
})();
const card = document.getElementById("portalCard"),
	button = document.getElementById("portalButton"),
	canvasTunnel = document.getElementById("tunnelCanvas"),
	tunnelContainer = document.getElementById("tunnelContainer"),
	skipButton = document.getElementById("skipButton"),
	skipBtn = document.getElementById("skipBtn");
if (card) {
	card.addEventListener("click", startPortal);
}
if (button) {
	button.addEventListener("click", (e) => {
		e.stopPropagation();
		startPortal();
	});
}

if (skipBtn) {
	skipBtn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		console.log("Skip button clicked!");
		skipToEnd();
	});
}

function showIframeContent() {
	console.log("Chuyển sang iframe!");
	
	// Ẩn tunnel canvas
	if (canvasTunnel) {
		canvasTunnel.style.display = "none";
	}
	if (tunnelContainer) {
		tunnelContainer.style.display = "none";
	}
	
	// Hiển thị iframe
	const iframeContainer = document.getElementById("iframeContainer");
	if (iframeContainer) {
		iframeContainer.style.display = "flex";
		iframeContainer.style.opacity = "1";
		console.log("Iframe đã hiển thị");
	} else {
		console.error("IframeContainer không tồn tại!");
	}
	
	// Dừng animation
	if (renderFrameId) {
		cancelAnimationFrame(renderFrameId);
	}
	isAnimating = false;
}

// Thêm phím tắt để skip (phím S)
document.addEventListener("keydown", (e) => {
	if (e.key.toLowerCase() === "s" && skipButton && skipButton.style.display === "block") {
		console.log("Skip shortcut pressed!");
		skipToEnd();
	}
});

function skipToEnd() {
	// Nhảy thẳng đến cuối đường hầm
	pct = 0.95;
	
	// Đảm bảo scene đã được khởi tạo
	if (scene) {
		const backOfCard = scene.children.find(child => child.userData && child.userData.isBackCard);
		if (backOfCard) {
			backOfCard.visible = true;
		}
	}
	
	// Ẩn nút skip
	skipButton.style.display = "none";
	
	// Dừng animation hiện tại và nhảy đến cuối
	if (renderFrameId) {
		cancelAnimationFrame(renderFrameId);
	}
	
	// Render một frame cuối để hiển thị vị trí mới
	if (renderer && scene && camera) {
		renderer.render(scene, camera);
	}
}
function startPortal() {
	// Hide the background immediately
	document.body.style.backgroundImage = "none";
	document.body.style.backgroundColor = "#000000";

	if (canvasTunnel) {
		canvasTunnel.style.display = "block";
	}
	if (tunnelContainer) {
		tunnelContainer.style.display = "flex";
	}
	initTunnel();
	render();
	
	// Hiển thị nút skip sau 2 giây
	setTimeout(() => {
		if (skipButton) {
			skipButton.style.display = "block";
			skipButton.classList.add("show");
		}
	}, 2000);
	
	setTimeout(() => {
		if (canvasTunnel) {
			canvasTunnel.classList.add("active");
		}
		if (card) {
			card.classList.add("zoomIn");
			setTimeout(() => {
				if (card) {
					card.style.display = "none";
				}
			}, 2000);
		}
	}, 100);
}
function createCircularPath() {
	const points = [];
	// Đường hầm thẳng - tạo points trên một đường thẳng
	const totalPoints = 10;
	const startPoint = new THREE.Vector3(0, 0, 0);
	const endPoint = new THREE.Vector3(0, 0, -50);
	
	for (let i = 0; i < totalPoints; i++) {
		const t = i / (totalPoints - 1);
		const point = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);
		points.push(point);
	}
	return points;
}
function returnToHome() {
	const approachAnimation = {
		progress: 0,
		duration: 1200,
		startTime: Date.now(),
		startPosition: camera.position.clone(),
		targetPosition: new THREE.Vector3(
			tunnelEndPoint.x - 5,
			tunnelEndPoint.y,
			tunnelEndPoint.z - 5
		),
		update: function () {
			const elapsed = Date.now() - this.startTime;
			this.progress = Math.min(elapsed / this.duration, 1);
			const t =
				this.progress < 0.5
					? 4 * this.progress * this.progress * this.progress
					: 1 - Math.pow(-2 * this.progress + 2, 3) / 2;
			camera.position.lerpVectors(this.startPosition, this.targetPosition, t);
			if (this.progress >= 1) startPortalTransition();
		}
	};
	function startPortalTransition() {
		const zoomAnimation = {
			progress: 0,
			duration: 500,
			startTime: Date.now(),
			startPosition: camera.position.clone(),
			targetPosition: new THREE.Vector3(
				tunnelEndPoint.x + 2,
				tunnelEndPoint.y,
				tunnelEndPoint.z + 2
			),
			update: function () {
				const elapsed = Date.now() - this.startTime;
				this.progress = Math.min(elapsed / this.duration, 1);
				const t = this.progress * this.progress;
				camera.position.lerpVectors(this.startPosition, this.targetPosition, t);
				if (this.progress > 0.5 && this.progress < 0.6) {
					scene.background = new THREE.Color(0xffffff);
					scene.fog = null;
				} else if (this.progress >= 0.6) {
					scene.background = new THREE.Color(0x000000);
					scene.fog = new THREE.FogExp2(0x000000, 0.005);
					if (this.progress >= 1) completePortalLoop();
				}
			}
		};
		animationQueue.push(zoomAnimation);
	}

	function completePortalLoop() {
		const tunnelCanvas = document.getElementById("tunnelCanvas");
		tunnelCanvas.style.transition = "opacity 0.7s ease-out";
		tunnelCanvas.style.opacity = "0";
		const card = document.getElementById("portalCard");
		card.classList.remove("zoomIn");
		setTimeout(() => {
			tunnelCanvas.style.display = "none";
			card.style.display = "flex";
			card.style.opacity = "0";
			card.style.transform = "scale(0.8)";
			card.style.transition = "all 1s ease-out";
			setTimeout(() => {
				card.style.opacity = "1";
				card.style.transform = "scale(1)";
				const portalContent = document.getElementById("portalContent");
				portalContent.style.opacity = "1";
				portalContent.style.transform = "scale(1)";
			}, 50);
		}, 700);
		cancelAnimationFrame(renderFrameId);
		isAnimating = false;
	}
	animationQueue.push(approachAnimation);
}
const animationQueue = [];
let isAnimating = true,
	tunnelEndPoint,
	renderFrameId,
	hoverTime = 0;
var w = window.innerWidth,
	h = window.innerHeight;
	var cameraSpeed = 0.003, // Tăng tốc độ nhanh hơn
	lightSpeed = 0.002,
	tubularSegments = 50,
	radialSegments = 12,
	tubeRadius = 3;
var renderer, scene, camera, tube;
var lights = [],
	path,
	geometry,
	material,
	pct = 0,
	pct2 = 0;
function captureCardFrontImage() {
	const canvas = document.createElement("canvas");
	canvas.width = 1280;
	canvas.height = 1820;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "rgba(10, 12, 18, 0.6)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, "#00ffaa");
	gradient.addColorStop(1, "#00a3ff");
	function drawBlob(x, y, wid, hei, color) {
		const grad = ctx.createRadialGradient(x, y, 0, x, y, wid / 2);
		grad.addColorStop(0, color);
		grad.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.ellipse(x, y, wid / 2, hei / 2, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.filter = "blur(12px)";
	drawBlob(150, 300, 250, 250, "rgba(0, 255, 170, 0.7)");
	drawBlob(350, 200, 200, 200, "rgba(0, 179, 255, 0.7)");
	drawBlob(250, 500, 180, 180, "rgba(64, 224, 208, 0.7)");
	drawBlob(400, 600, 220, 220, "rgba(30, 144, 255, 0.7)");
	ctx.filter = "none";
	ctx.font = "300 40px Unica One";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = "rgba(0, 255, 170, 0.7)";
	ctx.shadowBlur = 15;
	ctx.fillText("ENTER THE", canvas.width / 2, canvas.height / 2 - 30);
	ctx.fillText("WEB PORTAL", canvas.width / 2, canvas.height / 2 + 30);
	ctx.shadowBlur = 0;
	const buttonX = canvas.width / 2,
		buttonY = canvas.height / 2 + 120;
	ctx.fillStyle = "rgba(10, 12, 20, 0.3)";
	ctx.strokeStyle = "#00ffaa";
	ctx.lineWidth = 2;
	ctx.beginPath();
	if (ctx.roundRect) {
		ctx.roundRect(buttonX - 38, buttonY - 16, 76, 32, 16);
	} else {
		ctx.moveTo(buttonX - 38, buttonY - 16);
		ctx.lineTo(buttonX + 38, buttonY - 16);
		ctx.lineTo(buttonX + 38, buttonY + 16);
		ctx.lineTo(buttonX - 38, buttonY + 16);
		ctx.closePath();
	}
	ctx.fill();
	ctx.stroke();
	ctx.font = "400 20px Unica One";
	ctx.fillStyle = "white";
	ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
	ctx.shadowBlur = 5;
	ctx.fillText("GO", buttonX, buttonY);
	return canvas;
}
function createBackOfPortalCard() {
	const geometry = new THREE.PlaneGeometry(20, 28);

	// Create a new canvas for the back of the card rather than flipping
	const canvas = document.createElement("canvas");
	canvas.width = 1280;
	canvas.height = 1820;
	const ctx = canvas.getContext("2d");

	// Match the front card but with slight variation
	ctx.fillStyle = "rgba(10, 12, 18, 0.6)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Same gradient but reversed direction
	const gradient = ctx.createLinearGradient(canvas.width, canvas.height, 0, 0);
	gradient.addColorStop(0, "#00ffaa");
	gradient.addColorStop(1, "#00a3ff");

	// Create blobs with same function from captureCardFrontImage
	function drawBlob(x, y, wid, hei, color) {
		const grad = ctx.createRadialGradient(x, y, 0, x, y, wid / 2);
		grad.addColorStop(0, color);
		grad.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.ellipse(x, y, wid / 2, hei / 2, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	// Add glowing blobs in different positions
	ctx.filter = "blur(12px)";
	drawBlob(400, 400, 250, 250, "rgba(0, 255, 170, 0.7)");
	drawBlob(200, 300, 200, 200, "rgba(0, 179, 255, 0.7)");
	drawBlob(350, 700, 180, 180, "rgba(64, 224, 208, 0.7)");
	drawBlob(200, 900, 220, 220, "rgba(30, 144, 255, 0.7)");
	ctx.filter = "none";

	// Add text to back of card
	ctx.font = "300 40px Unica One";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = "rgba(0, 255, 170, 0.7)";
	ctx.shadowBlur = 15;
	ctx.fillText("Bắt đầu", canvas.width / 2, canvas.height / 2 - 30);
	ctx.fillText("Cuộc Phiêu Lưu", canvas.width / 2, canvas.height / 2 + 30);
	ctx.shadowBlur = 0;

	// Create a texture from the canvas
	const texture = new THREE.CanvasTexture(canvas);
	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.9,
		side: THREE.DoubleSide
	});

	return new THREE.Mesh(geometry, material);
}
function createCodeSnippetSprite(text) {
	const canvas = document.createElement("canvas");
	canvas.width = 300;
	canvas.height = 150;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#2d2d2d";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = "20px monospace";
	ctx.fillStyle = "#8be9fd";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	let lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], 10, 10 + i * 24);
	}
	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.LinearFilter;
	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true
	});
	const sprite = new THREE.Sprite(material);
	sprite.scale.set(15, 7.5, 1);
	return sprite;
}
function initTunnel() {
	if (!canvasTunnel) {
		console.error("canvasTunnel is null!");
		return;
	}
	renderer = new THREE.WebGLRenderer({
		canvas: canvasTunnel,
		antialias: true,
		alpha: true,
		powerPreference: "high-performance"
	});
	renderer.setSize(w, h);
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.005);
	camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
	const raycaster = new THREE.Raycaster(),
		mouse = new THREE.Vector2();
	canvasTunnel.addEventListener("click", function (event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		for (let i = 0; i < intersects.length; i++) {
			if (
				intersects[i].object.userData &&
				intersects[i].object.userData.isBackCard
			) {
				returnToHome();
				break;
			}
		}
	});
	const starsCount = 5000; // Tăng từ 2000 lên 5000
	const starsPositions = new Float32Array(starsCount * 3);
	for (let i = 0; i < starsCount; i++) {
		starsPositions[i * 3] = THREE.MathUtils.randFloatSpread(2000); // Tăng phạm vi từ 1500 lên 2000
		starsPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(2000);
		starsPositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(2000);
	}
	const starsGeometry = new THREE.BufferGeometry();
	starsGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(starsPositions, 3)
	);
	const starsTexture = new THREE.CanvasTexture(createCircleTexture());
	const starsMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 1,
		map: starsTexture,
		transparent: true
	});
	const starField = new THREE.Points(starsGeometry, starsMaterial);
	scene.add(starField);
	const organicPoints = createCircularPath();
	if (!organicPoints || organicPoints.length === 0) {
		console.error("organicPoints is empty!");
		return;
	}
	path = new THREE.CatmullRomCurve3(organicPoints);
	const tubeGeometry = new THREE.TubeBufferGeometry(
		path,
		50, // Đường hầm ngắn
		tubeRadius,
		radialSegments,
		false
	);
	
	// Check if geometry has attributes
	if (!tubeGeometry.attributes || !tubeGeometry.attributes.position) {
		console.error("tubeGeometry.attributes.position is null!");
		return;
	}
	
	const colors = [];
	for (let i = 0; i < tubeGeometry.attributes.position.count; i++) {
		const color = new THREE.Color(i % 2 === 0 ? "#ffffff" : "#cccccc");
		colors.push(color.r, color.g, color.b);
	}
	tubeGeometry.setAttribute(
		"color",
		new THREE.Float32BufferAttribute(colors, 3)
	);
	material = new THREE.MeshLambertMaterial({
		side: THREE.BackSide,
		vertexColors: true,
		wireframe: true,
		emissive: 0x333333,
		emissiveIntensity: 0.2
	});
	tube = new THREE.Mesh(tubeGeometry, material);
	scene.add(tube);
	const backOfCard = createBackOfPortalCard();
	const endPoint = organicPoints.length - 1;
	const position = organicPoints[endPoint];
	backOfCard.position.set(position.x, position.y, position.z);
	tunnelEndPoint = position;
	backOfCard.lookAt(organicPoints[endPoint - 5]);
	backOfCard.userData = { isBackCard: true };
	scene.add(backOfCard);
	const mainLight = new THREE.PointLight(0xffffff, 1, 50);
	scene.add(mainLight);
	scene.add(new THREE.AmbientLight(0x555555));
	const lightColors = [0xffffff, 0xcccccc, 0xffffff, 0xcccccc, 0xffffff];
	for (let i = 0; i < 5; i++) {
		const offset = i * 0.15 + (i % 3) * 0.05;
		let l = new THREE.PointLight(lightColors[i], 1.2, 20);
		lights.push(l);
		scene.add(l);
	}


	const snippetVarieties = [
		// Sự kiện 1858-1862
		[
			"1858: Pháp nổ súng vào Đà Nẵng",
			"Nguyễn Tri Phương chỉ huy",
			"Kháng cự quyết liệt",
			"Thất bại kế hoạch đánh nhanh"
		].join("\n"),

		// Sự kiện 1861
		[
			"1861: Nguyễn Trung Trực",
			"Đốt tàu Espérance",
			"Trên sông Nhật Tảo",
			"Chiến công vang dội"
		].join("\n"),

		// Hòa ước 1862
		[
			"1862: Hòa ước Nhâm Tuất",
			"Cắt ba tỉnh miền Đông",
			"Nam Kỳ bắt đầu mất",
			"Tinh thần kháng chiến"
		].join("\n"),

		// Trương Định 1864
		[
			"1864: Trương Định",
			"Tuẫn tiết ở Gò Công",
			"Cự lệnh bãi binh",
			"Tinh thần bất khuất"
		].join("\n"),

		// Mất Nam Kỳ 1867
		[
			"1867: Mất Nam Kỳ",
			"Vĩnh Long, An Giang",
			"Hà Tiên rơi vào tay Pháp",
			"Toàn bộ Nam Kỳ"
		].join("\n"),

		// Nguyễn Trung Trực 1868
		[
			"1868: Nguyễn Trung Trực",
			"Chiếm đồn Rạch Giá",
			"Rồi hi sinh anh dũng",
			"Tên tuổi lưu danh"
		].join("\n"),

		// Garnier 1873
		[
			"1873: Garnier chiếm Hà Nội",
			"Quân Cờ Đen phối hợp",
			"Garnier tử trận",
			"Cầu Giấy thắng lợi"
		].join("\n"),

		// Rivière 1882-1883
		[
			"1882-1883: Rivière",
			"Chiếm Hà Nội lần nữa",
			"Ngã xuống Cầu Giấy",
			"Lần thứ hai thất bại"
		].join("\n"),

		// Hiệp ước 1883-1884
		[
			"1883-1884: Hiệp ước",
			"Hác-măng và Patenôtre",
			"Chế độ bảo hộ",
			"Nước ta mất chủ quyền"
		].join("\n"),

		// Cần Vương 1885
		[
			"1885: Chiếu Cần Vương",
			"Kinh đô thất thủ",
			"Phong trào nổ rộng",
			"Kháng chiến toàn quốc"
		].join("\n"),

		// Bãi Sậy 1885-1889
		[
			"1885-1889: Bãi Sậy",
			"Nguyễn Thiện Thuật",
			"Khởi nghĩa kiên cường",
			"Chống Pháp quyết liệt"
		].join("\n"),

		// Hương Khê 1885-1896
		[
			"1885-1896: Hương Khê",
			"Phan Đình Phùng",
			"Cao Thắng lãnh đạo",
			"Phong trào Cần Vương"
		].join("\n"),

		// Ba Đình 1886-1887
		[
			"1886-1887: Ba Đình",
			"Đinh Công Tráng",
			"Phạm Bành chỉ huy",
			"Khởi nghĩa anh dũng"
		].join("\n"),

		// Phan Bội Châu 1904
		[
			"1904: Phan Bội Châu",
			"Thành lập Duy Tân Hội",
			"Phong trào cách mạng",
			"Tinh thần dân tộc"
		].join("\n"),

		// Đông Du 1905-1909
		[
			"1905-1909: Đông Du",
			"Phan Bội Châu khởi xướng",
			"Thanh niên xuất dương",
			"Học tập cách mạng"
		].join("\n"),

		// Duy Tân 1906-1908
		[
			"1906-1908: Duy Tân",
			"Phan Châu Trinh",
			"Phong trào cải cách",
			"Đông Kinh Nghĩa Thục"
		].join("\n"),

		// Nguyễn Tất Thành 1911
		[
			"1911: Nguyễn Tất Thành",
			"Rời bến Nhà Rồng",
			"Tìm đường cứu nước",
			"Bác Hồ vĩ đại"
		].join("\n"),

		// Yên Thế 1913
		[
			"Đến 1913: Yên Thế",
			"Hoàng Hoa Thám",
			"Khởi nghĩa kéo dài",
			"Chống Pháp kiên cường"
		].join("\n"),

		// Nguyễn Ái Quốc 1919
		[
			"1919: Nguyễn Ái Quốc",
			"Yêu sách 8 điểm",
			"Tại Versailles",
			"Tiếng nói dân tộc"
		].join("\n"),

		// Đảng Cộng sản 1920
		[
			"1920: Đảng Cộng sản",
			"Nguyễn Ái Quốc gia nhập",
			"Đọc Luận cương Lênin",
			"Con đường giải phóng"
		].join("\n"),

		// Thanh Niên 1925
		[
			"1925: Thanh Niên",
			"Hội Việt Nam",
			"Cách mạng đồng chí",
			"Báo Thanh Niên"
		].join("\n"),

		// Ba tổ chức cộng sản 1929
		[
			"1929: Ba tổ chức",
			"Cộng sản xuất hiện",
			"Đông Dương, An Nam",
			"Liên đoàn hợp nhất"
		].join("\n"),

		// Đảng Cộng sản Việt Nam 1930
		[
			"1930: Đảng Cộng sản",
			"Việt Nam thành lập",
			"Nguyễn Ái Quốc chủ trì",
			"Hương Cảng hợp nhất"
		].join("\n")
	];

	// Ẩn snippets (chữ) - không tạo snippets nữa
	// for (let i = 0; i < 20; i++) {
	// 	// Sử dụng snippet ngẫu nhiên từ danh sách lịch sử
	// 	let snippet =
	// 		snippetVarieties[Math.floor(Math.random() * snippetVarieties.length)];
	// 	let sprite = createCodeSnippetSprite(snippet);
	// 	sprite.position.set(
	// 		(Math.random() - 0.5) * 200,
	// 		(Math.random() - 0.5) * 200,
	// 		(Math.random() - 0.5) * 200
	// 	);
	// 	scene.add(sprite);
	// }

	// Add more white/star particles - tăng số lượng ngôi sao
	const additionalStars = 8000; // Tăng từ 5000 lên 8000
	const additionalStarsPositions = new Float32Array(additionalStars * 3);
	for (let i = 0; i < additionalStars; i++) {
		additionalStarsPositions[i * 3] = THREE.MathUtils.randFloatSpread(2500); // Tăng phạm vi từ 2000 lên 2500
		additionalStarsPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(2500);
		additionalStarsPositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(2500);
	}
	const additionalStarsGeometry = new THREE.BufferGeometry();
	additionalStarsGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(additionalStarsPositions, 3)
	);
	const additionalStarsMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 2,
		opacity: 0.7,
		transparent: true,
		map: starsTexture
	});
	const additionalStarField = new THREE.Points(
		additionalStarsGeometry,
		additionalStarsMaterial
	);
	scene.add(additionalStarField);
	window.onresize = function () {
		w = window.innerWidth;
		h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	};
}
function createCircleTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	// Draw a circle
	context.beginPath();
	context.arc(16, 16, 16, 0, 2 * Math.PI, false);
	context.fillStyle = "white";
	context.fill();

	// Add a soft glow effect
	const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

	context.globalCompositeOperation = "source-over";
	context.fillStyle = gradient;
	context.beginPath();
	context.arc(16, 16, 16, 0, 2 * Math.PI, false);
	context.fill();

	return canvas;
}

function render() {
	// Check if we reached the end of tunnel
	if (pct >= 0.99) {
		// Đến cuối đường hầm - chuyển sang iframe
		if (!window.iframeLoaded) {
			window.iframeLoaded = true;
			showIframeContent();
			return; // Stop rendering
		}
		return; // Don't continue
	}

	// Continue through tunnel
	pct += cameraSpeed;
	pct2 += lightSpeed;
	if (pct2 >= 0.995) {
		pct2 = 0;
	}
	
	const pt1 = path.getPointAt(pct);
	const pt2 = path.getPointAt(Math.min(pct + 0.01, 1));

	camera.position.set(pt1.x, pt1.y, pt1.z);
	camera.lookAt(pt2);

	// Move lights with camera
	const mainLight = lights[0];
	mainLight.position.set(pt2.x, pt2.y, pt2.z);

	for (let i = 1; i < lights.length; i++) {
		const offset = ((i * 13) % 17) / 20;
		const lightPct = (pct2 + offset) % 0.995;
		const pos = path.getPointAt(lightPct);
		lights[i].position.set(pos.x, pos.y, pos.z);
	}

	renderer.render(scene, camera);
	renderFrameId = requestAnimationFrame(render);
}
function createCodeSnippetSprite(text) {
	const canvas = document.createElement("canvas");
	canvas.width = 400;
	canvas.height = 250;
	const ctx = canvas.getContext("2d");

	// Fully transparent background, no border
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Syntax highlighting colors from popular themes
	const colors = {
		keyword: "#ff79c6", // pink
		string: "#f1fa8c", // yellow
		comment: "#6272a4", // blue-grey
		function: "#50fa7b", // green
		variable: "#8be9fd", // cyan
		tag: "#ff79c6", // pink
		attribute: "#50fa7b" // green
	};

	ctx.font = "20px 'Consolas', monospace";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";

	const lines = text.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let xPosition = 15;

		// Extremely simple syntax highlighting
		if (
			line.includes("const ") ||
			line.includes("function ") ||
			line.includes("if(") ||
			line.includes("return")
		) {
			// Keywords and flow control
			const parts = line.split(/\b/);
			for (const part of parts) {
				if (
					[
						"const",
						"function",
						"return",
						"if",
						"class",
						"=>",
						"import",
						"export"
					].includes(part)
				) {
					ctx.fillStyle = colors.keyword;
				} else if (part.startsWith('"') || part.startsWith("'")) {
					ctx.fillStyle = colors.string;
				} else if (part.startsWith("//")) {
					ctx.fillStyle = colors.comment;
				} else if (part.match(/^[a-zA-Z_][a-zA-Z0-9_]*\(/)) {
					ctx.fillStyle = colors.function;
				} else if (part.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
					ctx.fillStyle = colors.variable;
				} else {
					ctx.fillStyle = "#f8f8f2"; // default text color
				}

				const width = ctx.measureText(part).width;
				ctx.fillText(part, xPosition, 15 + i * 24);
				xPosition += width;
			}
		} else if (line.includes("<") && line.includes(">")) {
			// HTML-like syntax
			const parts = line.split(/(<\/?[a-zA-Z0-9-]+|>|="[^"]*")/g);
			for (const part of parts) {
				if (part.startsWith("<") && !part.startsWith("</")) {
					ctx.fillStyle = colors.tag;
				} else if (part.startsWith("</") || part === ">") {
					ctx.fillStyle = colors.tag;
				} else if (part.startsWith("=")) {
					ctx.fillStyle = colors.attribute;
				} else if (part.startsWith('"')) {
					ctx.fillStyle = colors.string;
				} else {
					ctx.fillStyle = "#f8f8f2"; // default text color
				}

				const width = ctx.measureText(part).width;
				ctx.fillText(part, xPosition, 15 + i * 24);
				xPosition += width;
			}
		} else if (line.includes("{") || line.includes("}") || line.includes(";")) {
			// CSS-like syntax
			ctx.fillStyle = "#f8f8f2"; // default for CSS
			ctx.fillText(line, xPosition, 15 + i * 24);
		} else {
			// Default rendering
			ctx.fillStyle = "#f8f8f2";
			ctx.fillText(line, 15, 15 + i * 24);
		}
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.LinearFilter;
	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		opacity: 0.8,
		blending: THREE.AdditiveBlending
	});

	const sprite = new THREE.Sprite(material);

	// Randomize scale for variety
	let scaleFactor = 8 + Math.random() * 12;
	sprite.scale.set(scaleFactor, scaleFactor * (canvas.height / canvas.width), 1);

	return sprite;
}

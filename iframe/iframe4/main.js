// Inspired by https://dashgo.com/

const content1 = document.querySelector('.content1')
// const content2 = document.querySelector('.content2')
// const content3 = document.querySelector('.content3')
const path1 = document.querySelector('.path2')
// const path2 = document.querySelector('.path3')
// const path3 = document.querySelector('.path4')
const path1Length = path1.getTotalLength()
// const path2Length = path2.getTotalLength()
// const path3Length = path3.getTotalLength()
path1.style.strokeDasharray  = path1Length

// Make the path progress lead ahead of scroll (adjust 0.2 as needed)
function getPathLeadPx() {
  return window.innerHeight * 0.35
}

path1.style.strokeDashoffset = calcDashoffset(window.innerHeight * 0.8 + getPathLeadPx(), content1, path1Length)

// path2.style.strokeDasharray  = path2Length
// path2.style.strokeDashoffset = path2Length

// path3.style.strokeDasharray  = path3Length
// path3.style.strokeDashoffset = path3Length

function calcDashoffset(scrollY, element, length) {
  const ratio = (scrollY - element.offsetTop) / element.offsetHeight
  const value = length - (length * ratio)
  return value < 0 ? 0 : value > length ? length : value
}

function scrollHandler() {
  const scrollY = window.scrollY + (window.innerHeight * 0.8)
  path1.style.strokeDashoffset = calcDashoffset(scrollY + getPathLeadPx(), content1, path1Length)
  // path2.style.strokeDashoffset = calcDashoffset(scrollY, content2, path2Length)
  // path3.style.strokeDashoffset = calcDashoffset(scrollY, content3, path3Length)
}

window.addEventListener('scroll', scrollHandler)

// Check iframe2 width and adjust aspect ratio
function checkIframe2Width() {
  const iframe2 = document.getElementById('iframe2')
  if (!iframe2) return
  
  const iframe2Width = iframe2.offsetWidth || iframe2.clientWidth
  const isPortrait = iframe2Width < 1024
  
  // Send message to iframe2 to change aspect ratio
  try {
    iframe2.contentWindow.postMessage({
      type: 'changeAspectRatio',
      portrait: isPortrait
    }, '*')
  } catch (e) {
    // Cross-origin or iframe not loaded yet
    console.log('Could not send message to iframe2:', e)
  }
  
  // Also update CSS directly on iframe2 element
  if (isPortrait) {
    iframe2.style.aspectRatio = '9/16'
  } else {
    iframe2.style.aspectRatio = '16/9'
  }
}

// Check on load and resize
window.addEventListener('load', checkIframe2Width)
window.addEventListener('resize', checkIframe2Width)

// Also check after a short delay to ensure iframe2 is loaded
setTimeout(checkIframe2Width, 500)
setTimeout(checkIframe2Width, 1000)

// Cleanup function
window.iframe4Cleanup = function() {
  window.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('load', checkIframe2Width)
  window.removeEventListener('resize', checkIframe2Width)
}


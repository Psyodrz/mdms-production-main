import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

const videoMap = {
  'Hero.mp4': 'hero.mp4',
  'Cinematic_reel_1.mp4': 'reel_1.mp4',
  'Cinematic_reel_2.mp4': 'reel_2.mp4',
  'Cinematic_reel_3.mp4': 'reel_3.mp4',
  'Cinematic_reel_4.mp4': 'reel_4.mp4',
  'Production_Project_1.mp4': 'project_1.mp4',
  'Production_Project_2.mp4': 'project_2.mp4',
  'Production_Project_3.mp4': 'project_3.mp4',
}

const photoMap = {
  'pexels-bence-szemerey-337043-75134.jpg': 'about-hero.jpg',
  'pexels-amar-8390627.jpg': 'about-bts.jpg',
  'pexels-ron-lach-8088390.jpg': 'services-hero.jpg',
  'pexels-amar-17094505.jpg': 'services-lighting.jpg',
  'pexels-ludvighedenborg-6310312.jpg': 'portfolio-hero.jpg',
  'pexels-amar-8981855.jpg': 'portfolio-equipment.jpg',
  'pexels-ahmetoktem-26743060.jpg': 'projects-outdoor.jpg',
  'pexels-mubariz-mammadli-269811889-22805567.jpg': 'team-1.jpg',
  'pexels-marian-chrzan-458084535-15583791.jpg': 'team-2.jpg',
  'pexels-built-different-1145612-13070910.jpg': 'team-3.jpg',
  'pexels-cadomaestro-1170412.jpg': 'careers-office.jpg',
  'pexels-pavel-danilyuk-7658310.jpg': 'careers-meeting.jpg',
  'pexels-airamdphoto-11627678.jpg': 'join-hero.jpg',
  'pexels-shvetsa-5682333.jpg': 'contact-studio.jpg',
  'pexels-edward-jenner-4250573.jpg': 'bg-luxury.jpg',
  'pexels-jan-van-der-wolf-11680885-16159464.jpg': 'bg-abstract.jpg',
  'pexels-abshky-11440223.jpg': 'bg-minimal.jpg',
}

const publicVideos = path.join(process.cwd(), 'apps/web/public/videos')
const publicImages = path.join(process.cwd(), 'apps/web/public/images')

fs.mkdirSync(publicVideos, { recursive: true })
fs.mkdirSync(publicImages, { recursive: true })

const videoSrc = path.join(process.cwd(), 'VIdeos')
for (const [oldName, newName] of Object.entries(videoMap)) {
  const src = path.join(videoSrc, oldName)
  const dest = path.join(publicVideos, newName)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`✅ ${oldName} → ${newName}`)
  } else {
    console.log(`⚠️  Not found: ${oldName}`)
  }
}

const photoSrc = path.join(process.cwd(), 'PHottos')
for (const [oldName, newName] of Object.entries(photoMap)) {
  const src = path.join(photoSrc, oldName)
  const dest = path.join(publicImages, newName)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`✅ ${oldName} → ${newName}`)
  } else {
    console.log(`⚠️  Not found: ${oldName}`)
  }
}

console.log('\n🎉 All media files renamed and moved successfully!')

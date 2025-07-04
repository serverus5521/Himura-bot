
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const fs = require('fs');
const tts = require('@google-cloud/text-to-speech');
const client = new Client({ authStrategy: new LocalAuth() });

const ttsClient = new tts.TextToSpeechClient();

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('🤖 Tokyo Himura listo'));

client.on('message', async msg => {
  const txt = msg.body.split(' ');
  const cmd = txt[0].toLowerCase();

  if(cmd === '/menu') {
    msg.reply('🌸 *Tokyo Himura*\nComandos:\n/menu18\n/saludo\n/meme\n/sticker\n/play <texto>\n/audio <idioma?> <texto>');
  }

  if(cmd === '/menu18') msg.reply('🔞 +18: /hentai');

  if(cmd === '/saludo') msg.reply('¡Hola! Soy *Tokyo Himura*, tu bot kawaii.');

  if(cmd === '/meme') {
    const res = await fetch('https://meme-api.com/gimme');
    const json = await res.json();
    const media = await MessageMedia.fromUrl(json.url);
    client.sendMessage(msg.from, media, { caption: json.title });
  }

  if(cmd === '/hentai') {
    const res = await fetch('https://nekos.life/api/v2/img/hentai');
    const json = await res.json();
    const media = await MessageMedia.fromUrl(json.url);
    client.sendMessage(msg.from, media);
  }

  if(cmd === '/sticker' && msg.hasMedia) {
    const media = await msg.downloadMedia();
    client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
  }

  if(cmd === '/play' && txt.length > 1) {
    msg.reply('🎶 Este comando requiere integración adicional con una API de YouTube o un bot adicional.');
  }

  if(cmd === '/audio') {
    let lang = 'es';
    let text = msg.body.replace('/audio', '').trim();
    const first = text.split(' ')[0];
    if(first.length === 2) {
      lang = first;
      text = text.slice(3);
    }
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' }
    });
    fs.writeFileSync('/tmp/audio.mp3', response.audioContent);
    const media = MessageMedia.fromFilePath('/tmp/audio.mp3');
    client.sendMessage(msg.from, media, { sendAudioAsVoice: true });
  }
});

client.initialize();

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = { user, text };

  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  };
  try { await fetch("/poll", options); } catch (err) {
    console.error(err);
  }

}

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch("/poll");
    json = await res.json();

    if (res.status >= 400) {
      throw new Error('request failed', res.status)
    }
    allChat = json.msg;
    render();
    nFailedTries = 0;
  } catch (err) {
    console.error("polling error", err)
    nFailedTries++;
  }

}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat?.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html?.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// linear strategy: add 5 seconds to time till next retry
// cf exponential - double the time on every failure
const BACKOFF = 5000;
const MAX_INTERVAL = 120000;
let nFailedTries = 0;
let timeToMakeNextRequest = 0;
async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    console.log('before req', { timeToMakeNextRequest, time })
    console.log('perf now', performance.now())
    await getNewMsgs();
    timeToMakeNextRequest = performance.now() + INTERVAL + Math.min(nFailedTries * BACKOFF, MAX_INTERVAL);
    console.log('after req', { timeToMakeNextRequest })
  }
  requestAnimationFrame(rafTimer)
}

requestAnimationFrame(rafTimer)

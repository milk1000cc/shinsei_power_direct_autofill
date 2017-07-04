const EXTENSION_NAME = 'Shinsei Power Direct AutoFill';

const SESSION_STORAGE_KEY = 'spdafSecurityCardTable';

const TEMPLATE = {
  restorePasswordForm:
    '<div class="spdaf-overlay"></div>' +
    '<div class="spdaf-box">' +
    '  <p class="spdaf-box__title">' + EXTENSION_NAME + '</p>' +
    '  <p class="spdaf-box__text spdaf-box__text--form">復元用パスワードを入力してください。</p>' +
    '  <form class="spdaf-box__form">' +
    '    <input type="password" class="spdaf-box__input" autocomplete="off" />' +
    '    <input type="submit" value="OK" class="spdaf-box__button" />' +
    '  </form>' +
    '  <p class="spdaf-box__invalid">パスワードが違います。</p>' +
    '</div>',

  noSettingDialog:
    '<div class="spdaf-overlay"></div>' +
    '<div class="spdaf-box spdaf-box--no-setting">' +
    '  <p class="spdaf-box__title">' + EXTENSION_NAME + '</p>' +
    '  <p class="spdaf-box__text">拡張機能の「オプション」から、ログイン情報を設定してください。</p>' +
    '</div>'
};

function main() {
  if (!isLoginScreen()) {
    return;
  }

  chrome.storage.local.get(null, function(data) {
    if (Object.keys(data).length > 0) {
      login(data);
    } else {
      showNoSettingDialog();
    }
  });
}

function isLoginScreen() {
  return (document.title === 'ログインスクリーン') ||
    (document.title.toLowerCase() === 'login screen');
}

function login(data) {
  var accountIdContainer = document.querySelector('#main-left-account input');
  accountIdContainer ? page1(data) : page2();
}

function page1(data) {
  showRestorePasswordForm(function(restorePassword, form) {
    var accountId = decrypt(data.accountId, restorePassword);
    var accountPin = decrypt(data.accountPin, restorePassword);
    var accountPassword = decrypt(data.accountPassword, restorePassword);
    var securityCardTable = decryptSecurityCardTable(data.securityCardTable, restorePassword);

    if (accountId === '') {
      showError();
      return;
    }

    document.body.removeChild(form);

    disableSecurityKeyboard();
    document.querySelector('#main-left-account input').value = accountId;
    document.querySelector('#main-left-pin input').value = accountPin;
    document.querySelector('#main-left-password input').value = accountPassword;

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(securityCardTable));

    submit();
  });
}

function showRestorePasswordForm(callback) {
  var div = document.createElement('div');
  div.innerHTML = TEMPLATE.restorePasswordForm;
  document.body.appendChild(div);

  var input = document.querySelector('.spdaf-box__input');
  input.focus();
  document.querySelector('.spdaf-box__form').addEventListener('submit', function(e) {
    e.preventDefault();
    callback(input.value, div);
  });
}

function decrypt(value, restorePassword) {
  try {
    return CryptoJS.AES.decrypt(value, restorePassword).toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return '';
  }
}

function decryptSecurityCardTable(table, restorePassword) {
  var result = [];

  for (var i = 0; i < table.length; i++) {
    result[i] = decrypt(table[i], restorePassword);
  }
  return result;
}

function showError() {
  document.querySelector('.spdaf-box').setAttribute('class', 'spdaf-box spdaf-box--invalid');
  document.querySelector('.spdaf-box__invalid').style.display = 'block';
}

function disableSecurityKeyboard() {
  document.querySelector('#securitykeyboard').checked = false;
}

function submit() {
  location.href = "javascript: window.CheckLogonInputs();";
}

function showNoSettingDialog() {
  var div = document.createElement('div');
  div.innerHTML = TEMPLATE.noSettingDialog;
  document.body.appendChild(div);
}

function page2(data) {
  var securityCardTable = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  var c, n = 3;
  var strong = document.querySelectorAll('#main-left-security strong');
  var input = document.querySelectorAll('input[type="password"]');

  disableSecurityKeyboard();

  while (c = strong[--n]) {
    c = c.innerHTML;
    input[n].value = securityCardTable[c.charAt(1)].split('')[c.charCodeAt(0) - 65];
  }

  submit();
}

main();

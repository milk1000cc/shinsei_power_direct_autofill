var restorePasswordElem;

function saveOptions() {
  chrome.storage.local.set(getSavedValues(), showStatus('保存しました。'));
}

function getSavedValues() {
  return {
    accountId: encrypt(document.getElementById('accountId').value),
    accountPin: encrypt(document.getElementById('accountPin').value),
    accountPassword: encrypt(document.getElementById('accountPassword').value),
    securityCardTable: getSecurityCardTable()
  };
}

function encrypt(value) {
  return CryptoJS.AES.encrypt(value, restorePasswordElem.value).toString();
}

function getSecurityCardTable() {
  var table = [];
  var securityCardElems = document.getElementsByName('securityCard');

  for (var i = 0; i < securityCardElems.length; i++) {
    table.push(encrypt(securityCardElems[i].value));
  };

  return table;
}

function showStatus(msg) {
  var elem = document.getElementById('status');
  elem.textContent = msg;
}

document.addEventListener('DOMContentLoaded', function() {
  restorePasswordElem = document.getElementById('restorePassword');
  document.getElementById('accountId').focus();
});

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  saveOptions();
});

(() => {
    var _a;
    const branchName = (_a = document.querySelector('.ref-container')) === null || _a === void 0 ? void 0 : _a.title;
    if (!branchName) {
        return;
    }
    const result = /CU-([a-z0-9]+)/.exec(branchName);
    if (!result) {
        return;
    }
    const taskId = result[1];
    const taskUrl = `https://app.clickup.com/t/${taskId}`;
    const firstActionButton = document.querySelector('.detail-page-header-actions :first-child');
    const anchorElement = document.createElement('a');
    anchorElement.classList.add(...'gl-button btn btn-md btn-default gl-display-none gl-md-display-block js-issuable-edit'.split(' '));
    anchorElement.innerHTML = '<span class="gl-button-text">ClickUp</span>';
    anchorElement.href = taskUrl;
    anchorElement.target = '_blank';
    firstActionButton.parentNode.insertBefore(anchorElement, firstActionButton);
    firstActionButton.classList.add('gl-md-ml-3');
})();
//# sourceMappingURL=content_scripts.js.map
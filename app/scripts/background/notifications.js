/**
 * Show a basic notification
 * @param {object} options notification options
 * @param {function} [onClick] optional callback function executed when the notification is clicked
 */
export const ShowBasicNotification = async (options, onClick = () => {}) => {
  const onNotificationClicked = (notificationId) => {
    browser.notifications.clear(notificationId);
    onClick.call(null, notificationId);
  };

  if (browser.notifications.onClicked.hasListener(onNotificationClicked)) {
    browser.notifications.onClicked.removeListener(onNotificationClicked);
  }

  browser.notifications.onClicked.addListener(onNotificationClicked);

  browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("images/icon-48.png"),
    title: browser.i18n.getMessage("ExtensionName"),
    ...options,
  });
};

export function saveNotification(notification) {

  const oldNotifications =
    JSON.parse(
      localStorage.getItem("notifications")
    ) || [];


  const updated = [

    {
      ...notification,
      read:false,
      id:Date.now()
    },

    ...oldNotifications

  ];


  localStorage.setItem(
    "notifications",
    JSON.stringify(updated)
  );

}



export function getNotifications(){

  return (
    JSON.parse(
      localStorage.getItem("notifications")
    )
    ||
    []
  );

}



export function markAllRead(){

  const notifications =
    getNotifications();


  const updated =
    notifications.map(
      (item)=>({

        ...item,

        read:true

      })
    );


  localStorage.setItem(
    "notifications",
    JSON.stringify(updated)
  );

}



export function clearNotifications(){

  localStorage.removeItem(
    "notifications"
  );

}
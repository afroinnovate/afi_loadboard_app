import { NavLink } from "@remix-run/react";


const sidebarLinks = [
  { name: 'Overview', to: '/dashboard/'},
  { name: 'View Loads', to: '/dashboard/loads/view/' },
  { name: 'Add Loads', to: '/dashboard/loads/add/' },
  { name: 'Bids', to: '/dashboard/loads/bids/' },
  // ... other sub-task links
];

export default function Sidebar({ activeSection }) {
  var renderingLinks = sidebarLinks
  if (activeSection === "home"){
    renderingLinks = [
      { name: 'Overview', to: '/dashboard/'},
    ]
  }else {
    renderingLinks = [
      { name: 'View Loads', to: '/dashboard/loads/view/' },
      { name: 'Add Loads', to: '/dashboard/loads/add/' },
      { name: 'Bids', to: '/dashboard/loads/bids/' },
    ]
  }
  return (
    <aside className="w-64 shadow-lg h-screen overflow-y-auto py-4 px-3 bg-gray-200 text-black rounded" aria-label="Sidebar">
      <ul className="space-y-2 pl-4">
        {renderingLinks.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center p-2 text-base font-normal text-black rounded-lg bg-gray-300"
                  : "flex items-center p-2 text-base font-normal text-black rounded-lg hover:bg-gray-100 dark:hover:bg-gray-400"
              }
            >
              { link.name === 'Overview' && (
                <svg className="icon-class h-6 w-6 mr-2" viewBox="0 0 123.59 122.88" xmlns="http://www.w3.org/2000/svg"> 
                  <path d="M92.36,29.38v60.2a1.88,1.88,0,0,1,0,.34c0,.65,0,1.28-.06,1.88v4.34a11.41,11.41,0,0,1-3.39,7.64,10.35,10.35,0,0,1-7.4,3.14H81a53.86,53.86,0,0,1-8.29,0H23v5.14A4.88,4.88,0,0,0,27.88,117H96.44a4.9,4.9,0,0,0,4.88-4.88V34.26a4.92,4.92,0,0,0-4.88-4.88ZM47.78,77.26l14.95.25a15.38,15.38,0,0,1-7,12.87L47.78,77.26ZM47,72.82,46.78,56V54.84l1.15.09h0a21.59,21.59,0,0,1,4.13.68,19.92,19.92,0,0,1,3.78,1.45A19.34,19.34,0,0,1,66.48,73.25l.09,1.11H65.43L48.1,73.85h-1l-.17-1ZM48.9,57l.17,14.83,15.21.43a17.44,17.44,0,0,0-9.41-13.47,22,22,0,0,0-3.34-1.28c-1-.17-1.76-.34-2.63-.51ZM42.77,75.75,51.3,90.07a17.64,17.64,0,0,1-8.53,2.22,16.54,16.54,0,1,1-.7-33.07l.7,16.53Zm.7-53.63h4.87a.4.4,0,0,1,.43.43V35.49a.4.4,0,0,1-.43.43H43.47a.4.4,0,0,1-.43-.43V22.55a.46.46,0,0,1,.43-.43Zm25.7,0H74a.4.4,0,0,1,.43.43V35.49a.4.4,0,0,1-.43.43H69.17a.4.4,0,0,1-.43-.43V22.55a.46.46,0,0,1,.43-.43ZM56.32,12.91h4.87a.4.4,0,0,1,.43.43V35.49a.4.4,0,0,1-.43.43H56.32a.4.4,0,0,1-.43-.43V13.34a.4.4,0,0,1,.43-.43Zm-38.54,3.3h4.87a.41.41,0,0,1,.43.44V35.49a.4.4,0,0,1-.43.43H17.78a.4.4,0,0,1-.43-.43V16.65c-.09-.27.17-.44.43-.44Zm12.84-3.3h4.87a.4.4,0,0,1,.43.43V35.49a.4.4,0,0,1-.43.43H30.62a.4.4,0,0,1-.43-.43V13.34a.4.4,0,0,1,.43-.43ZM10.79,0h70.7a10.72,10.72,0,0,1,7.62,3.17l.17.19a10.71,10.71,0,0,1,3,7.43V23.47h4.16a10.81,10.81,0,0,1,10.78,10.79v77.83a10.81,10.81,0,0,1-10.78,10.79H27.88a10.82,10.82,0,0,1-10.79-10.79v-5.17h-6.3a10.76,10.76,0,0,1-7.62-3.17h0A10.74,10.74,0,0,1,0,96.14V10.79A10.82,10.82,0,0,1,10.79,0Zm70.7,5.91H10.79a4.88,4.88,0,0,0-4.88,4.88V40.92H86.37V10.79a4.87,4.87,0,0,0-1.31-3.33l-.12-.12a4.9,4.9,0,0,0-3.45-1.43ZM5.91,46.83V96.14a4.86,4.86,0,0,0,1.43,3.44h0A4.87,4.87,0,0,0,10.79,101H81.12a6.11,6.11,0,0,0,3.33-1.26c1.26-1.14,1.72-3.55,1.92-7.53V46.83Z" />
                </svg>
              )}
               { link.name.startsWith('View') && (
                <svg className="icon-class h-6 w-6 mr-2" viewBox="0 0 123.59 122.88" xmlns="http://www.w3.org/2000/svg"> 
                  <path d="M92,94.8a10.19,10.19,0,1,1-7.19,3,10.16,10.16,0,0,1,7.19-3ZM52.49,112.06H7.82A7.87,7.87,0,0,1,0,104.23V7.82A7.85,7.85,0,0,1,7.82,0h94.92a7.81,7.81,0,0,1,5.51,2.3l.26.29a7.81,7.81,0,0,1,2,5.23v74c-1-.49-2-.94-3-1.35A44.66,44.66,0,0,0,103.07,79V7.82l0-.15L103,7.6a.33.33,0,0,0-.22-.11H7.82a.34.34,0,0,0-.33.33v96.41a.39.39,0,0,0,.33.33H50.38l0,.35V105a11.15,11.15,0,0,0,2.14,7.08Zm8.4-8.5a54,54,0,0,1,5.16-5.44c7.21-6.56,16.21-10.87,24.68-11s17.9,3.77,26.05,10.49a60.92,60.92,0,0,1,6.3,6,2,2,0,0,1,.11,2.53,40.5,40.5,0,0,1-7.7,8.22c-6.45,5.15-14.84,8.49-22.52,8.54s-16.19-3.2-23-8a45.08,45.08,0,0,1-9.19-8.71,2,2,0,0,1,.11-2.6Zm7.83-2.51a48.45,48.45,0,0,0-3.81,3.89,40.6,40.6,0,0,0,7.33,6.69C78.38,116,86.12,119,93,118.93s14.34-3.11,20.08-7.69a35.61,35.61,0,0,0,6-6.17,55.66,55.66,0,0,0-4.77-4.45c-7.39-6.09-16-9.74-23.47-9.59s-15.59,4.11-22.08,10ZM38.07,73.37H86.44a.57.57,0,0,1,.55.55v3.55a42.45,42.45,0,0,0-13.06,3.6l-.54.25H38.07a.56.56,0,0,1-.55-.55V73.92a.55.55,0,0,1,.55-.55ZM28.13,26.58a4.57,4.57,0,1,1-4.56,4.56,4.57,4.57,0,0,1,4.56-4.56Zm9.94.59H86.44a.56.56,0,0,1,.55.55v6.85a.58.58,0,0,1-.55.55H38.07a.57.57,0,0,1-.55-.55V27.72a.55.55,0,0,1,.55-.55ZM28.13,49.68a4.57,4.57,0,1,1-4.56,4.57,4.57,4.57,0,0,1,4.56-4.57Zm9.94.59H86.44a.56.56,0,0,1,.55.55v6.85a.58.58,0,0,1-.55.55H38.07a.57.57,0,0,1-.55-.55V50.82a.55.55,0,0,1,.55-.55ZM28.13,72.78a4.57,4.57,0,1,1-4.56,4.57,4.58,4.58,0,0,1,4.56-4.57Zm61,24a3.95,3.95,0,1,1-3.94,4,4,4,0,0,1,3.94-4Z" />
                </svg>
              )}
              { link.name.startsWith('Add') && (
                <svg className="icon-class h-6 w-6 mr-2" viewBox="0 0 123.59 122.88" xmlns="http://www.w3.org/2000/svg"> 
                 <path fillRule="evenodd" clipRule="evenodd" d="M65.959,67.42h38.739c5.154,0,9.368,4.219,9.368,9.367v36.725 c0,5.154-4.221,9.369-9.368,9.369H65.959c-5.154,0-9.369-4.215-9.369-9.369V76.787C56.59,71.639,60.805,67.42,65.959,67.42 L65.959,67.42L65.959,67.42z M20.464,67.578c-1.495,0-2.74-1.352-2.74-2.988c0-1.672,1.209-2.989,2.74-2.989H43.88 c1.495,0,2.741,1.353,2.741,2.989c0,1.672-1.21,2.988-2.741,2.988H20.464L20.464,67.578L20.464,67.578z M87.795,18.186h9.822 c1.923,0,3.703,0.783,4.947,2.063c1.28,1.281,2.064,3.025,2.064,4.947v33.183h-6.051V25.196c0-0.285-0.107-0.533-0.285-0.711 c-0.177-0.178-0.426-0.285-0.711-0.285H87.76v34.18h-6.014V7.011c0-0.285-0.107-0.534-0.285-0.711 c-0.178-0.178-0.428-0.285-0.712-0.285H6.976c-0.285,0-0.535,0.106-0.712,0.285C6.085,6.478,5.979,6.726,5.979,7.011v83.348 c0,0.285,0.107,0.533,0.285,0.711s0.427,0.285,0.711,0.285h38.871v6.014H22.812v11.174c0,0.285,0.107,0.535,0.285,0.713 c0.177,0.176,0.427,0.285,0.711,0.285l22.038-0.002v6.014H23.844c-1.922,0-3.701-0.783-4.946-2.064 c-1.282-1.279-2.064-3.023-2.064-4.947l0-11.172H7.011c-1.922,0-3.701-0.785-4.946-2.064C0.783,94.023,0,92.279,0,90.357V7.011 C0,5.089,0.783,3.31,2.064,2.064C3.345,0.783,5.089,0,7.011,0h73.774c1.921,0,3.701,0.783,4.947,2.063 c1.28,1.282,2.063,3.025,2.063,4.947V18.186L87.795,18.186L87.795,18.186L87.795,18.186z M20.428,28.647 c-1.495,0-2.74-1.353-2.74-2.99c0-1.672,1.21-2.989,2.74-2.989l46.833,0c1.495,0,2.739,1.353,2.739,2.989 c0,1.672-1.208,2.99-2.739,2.99L20.428,28.647L20.428,28.647L20.428,28.647z M20.428,48.114c-1.495,0-2.74-1.353-2.74-2.989 c0-1.672,1.21-2.989,2.74-2.989l46.833,0c1.495,0,2.739,1.352,2.739,2.989c0,1.672-1.208,2.989-2.739,2.989L20.428,48.114 L20.428,48.114L20.428,48.114z M73.868,98.787c-2.007,0-3.634-1.627-3.634-3.635c0-2.006,1.627-3.633,3.634-3.633h7.823v-7.83 c0-2.006,1.628-3.633,3.634-3.633s3.634,1.627,3.634,3.633v7.83h7.829c2.007,0,3.634,1.627,3.634,3.633 c0,2.008-1.627,3.635-3.634,3.635h-7.823v7.83c0,2.006-1.627,3.633-3.634,3.633c-2.006,0-3.634-1.627-3.634-3.633v-7.83H73.868 L73.868,98.787L73.868,98.787z" />
                </svg>
              )}
              { link.name.startsWith('Bids') && (
                <svg className="icon-class h-6 w-6 mr-2" viewBox="0 0 123.59 122.88" xmlns="http://www.w3.org/2000/svg"> 
                 <path d="M56.3,24.25l-.64.63L60,29.15,47,41.65l-4.21-4.4L25.12,55c-2.84,2.84-7.23-1.55-4.39-4.39L38.5,32.78,35,29.11,47.24,16.6l4,3.92.67-.67c2.83-2.84,7.22,1.57,4.39,4.4ZM28.43,71.92a1.82,1.82,0,0,1,2.6,0,1.88,1.88,0,0,1,0,2.64l-3.16,3.19,3.16,3.2a1.86,1.86,0,0,1,0,2.62,1.82,1.82,0,0,1-2.59,0L25.3,80.38l-3.15,3.19a1.82,1.82,0,0,1-2.6,0,1.87,1.87,0,0,1,0-2.64l3.15-3.2-3.15-3.19a1.85,1.85,0,0,1,0-2.62,1.82,1.82,0,0,1,2.59,0l3.14,3.18,3.14-3.19ZM6,5.38A.65.65,0,0,0,5.34,6V116.86a.63.63,0,0,0,.62.62H96.52a.63.63,0,0,0,.62-.62V6a.64.64,0,0,0-.62-.62Zm0,117.5a6,6,0,0,1-6-6V6A6,6,0,0,1,6,0H96.48a6,6,0,0,1,6,6V116.87a6,6,0,0,1-6,6Zm75.61-18.44a2.72,2.72,0,0,0,0-5.43H45.48a2.72,2.72,0,0,0,0,5.43H81.62Zm0-24.06a2.71,2.71,0,0,0,0-5.42H45.48a2.71,2.71,0,0,0,0,5.42Zm-62,21.21a2.41,2.41,0,0,1,4-2.69L25,100.85l4.52-5.66a2.41,2.41,0,0,1,3.72,3.06l-6.52,8.08a3,3,0,0,1-.58.55,2.42,2.42,0,0,1-3.35-.67l-3.12-4.62Zm60.63-40H52.41c-3.17,0-3.16-5,0-5h3A2.49,2.49,0,0,1,56.54,52H76.15a2.48,2.48,0,0,1,1.15,4.65h3c3.2,0,3.2,4.94,0,4.94ZM46.74,14.07l-14.3,14.3c-2.26,2.26-5.76-1.25-3.5-3.5l14.31-14.3c2.25-2.25,5.75,1.25,3.49,3.5ZM65.91,33.23l-14.3,14.3c-2.26,2.26-5.76-1.25-3.5-3.5l14.3-14.3c2.25-2.26,5.76,1.25,3.5,3.5Z"/>
                </svg>
              )}
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

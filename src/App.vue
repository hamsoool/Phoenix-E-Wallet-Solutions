<template>
   
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp "
        rel="stylesheet">  
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
       
    </head>
    
    <router-view/>
</template>
    
<script>
export default {
    name: 'App'
}
</script>
    
<style>
    /* Base Styles & Variables */
    :root {
      --color-primary: #ff5722;
      --color-primary-light: #ff9800;
      --color-white: #fff;
      --color-dark: #333;
      --color-dark-variant: #555;
      --color-light: #f0f0f0;
      --color-light-variant: #f8f9fa;
      --color-success: #28a745;
      --color-danger: #dc3545;
      --card-padding: 20px;
      --border-radius: 10px;
      --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      --transition: all 0.3s ease;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
    }
    
    body {
      background-color: var(--color-light-variant);
      color: var(--color-dark);
      min-height: 100vh;
    }
    
    .container {
      display: grid;
      grid-template-columns: 240px 1fr 300px;
      gap: 20px;
      width: 100%;
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }
    
    /* Sidebar Styles */
    #sidebar {
      background-color: var(--color-white);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      height: calc(100vh - 40px);
      position: sticky;
      top: 20px;
    }
    
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      border-bottom: 1px solid var(--color-light);
    }
    
    .logo {
      display: flex;
      justify-content: center;
    }
    
    .logo img {
      width: 200px;
      height: 200px;
      margin-left: 5px;
    }
    
    .close-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-dark-variant);
    }
    
    .close-btn:hover {
      color: var(--color-dark);
    }
    
    .sidebar-nav {
      padding: 15px 0;
    }
    
    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: var(--color-dark-variant);
      text-decoration: none;
      transition: var(--transition);
      border-radius: 6px;
      margin: 4px 10px;
    }
    
    .sidebar-nav a.active {
      background-color: var(--color-primary);
      color: var(--color-white);
    }
    
    .sidebar-nav a:hover:not(.active) {
      background-color: var(--color-light);
    }
    
    .sidebar-nav .material-icons {
      margin-right: 10px;
    }
    
    /* Main Content Styles */
    main {
      background-color: var(--color-white);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: var(--card-padding);
    }
    
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .date {
      background-color: var(--color-light-variant);
      padding: 8px 15px;
      border-radius: 6px;
    }
    
    .date input {
      border: none;
      background: transparent;
      color: var(--color-dark-variant);
      cursor: pointer;
    }
    
    /* Card Layout */
    .insights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background-color: var(--color-white);
      padding: var(--card-padding);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      transition: var(--transition);
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .card .material-icons {
      font-size: 30px;
      color: var(--color-primary);
      margin-bottom: 10px;
    }
    
    .card h3 {
      color: var(--color-dark-variant);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    
    .card h1 {
      font-size: 1.6rem;
      margin-bottom: 10px;
    }
    
    .card small {
      color: var(--color-dark-variant);
      font-size: 0.8rem;
    }
    
    /* Table Styles */
    .recent-logs {
      margin-top: 30px;
    }
    
    .recent-logs h2 {
      margin-bottom: 15px;
      color: var(--color-dark);
    }
    
    .table-wrapper {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    thead tr {
      background-color: var(--color-light-variant);
      border-bottom: 1px solid var(--color-light);
    }
    
    th {
      padding: 12px;
      text-align: left;
      color: var(--color-dark-variant);
      font-weight: 600;
    }
    
    td {
      padding: 12px;
      color: var(--color-dark-variant);
      border-bottom: 1px solid var(--color-light);
    }
    
    tbody tr:hover {
      background-color: var(--color-light-variant);
    }
    
    .success {
      color: var(--color-success);
    }
    
    .failed {
      color: var(--color-danger);
    }
    
    .view-all {
      display: block;
      text-align: center;
      color: var(--color-primary);
      margin-top: 15px;
      text-decoration: none;
      font-weight: 500;
    }
    
    .view-all:hover {
      text-decoration: underline;
    }
    
    /* Right Panel Styles */
    .right-panel {
      background-color: var(--color-white);
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      height: calc(100vh - 40px);
      position: sticky;
      top: 20px;
      overflow-y: auto;
    }
    
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--card-padding);
      border-bottom: 1px solid var(--color-light);
    }
    
    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .info p {
      font-weight: 500;
    }
    
    .info small {
      color: var(--color-dark-variant);
    }
    
    .profile-photo .material-icons {
      font-size: 36px;
      color: var(--color-primary);
    }
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-dark-variant);
    }
    
    /* Wallet Card Styles */
    .wallet-summary {
      padding: var(--card-padding);
    }
    
    .wallet-summary h2 {
      margin-bottom: 15px;
      color: var(--color-dark);
    }
    
    .wallet-card {
      background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
      color: var(--color-white);
      padding: var(--card-padding);
      border-radius: var(--border-radius);
      margin-bottom: 20px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .card-balance {
      margin-bottom: 20px;
    }
    
    .card-balance h1 {
      font-size: 1.8rem;
      margin-bottom: 5px;
    }
    
    .card-actions {
      display: flex;
      gap: 10px;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background-color: rgba(255, 255, 255, 0.2);
      color: var(--color-white);
      border: none;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .action-btn:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    /* Enhanced Responsive Styles */
    @media screen and (max-width: 1400px) {
      .container {
        grid-template-columns: 240px 1fr;
        padding: 15px;
      }

      .right-panel {
        display: none;
      }

      .insights {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media screen and (max-width: 1200px) {
      .container {
        grid-template-columns: 240px 1fr;
        gap: 15px;
      }

      .card h1 {
        font-size: 1.4rem;
      }

      .wallet-card {
        padding: 15px;
      }
    }

    @media screen and (max-width: 992px) {
      .container {
        grid-template-columns: 1fr;
        padding: 10px;
      }

      #sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        height: 100vh;
        width: 280px;
        z-index: 1000;
        transition: var(--transition);
        background: var(--color-white);
      }

      #sidebar.active {
        left: 0;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }

      .close-btn {
        display: block;
        position: absolute;
        right: 15px;
        top: 15px;
        font-size: 24px;
      }

      .menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 1001;
        background: var(--color-white);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        box-shadow: var(--box-shadow);
        cursor: pointer;
        transition: var(--transition);
      }

      .menu-btn:hover {
        background: var(--color-light);
      }

      .menu-btn .material-icons {
        font-size: 24px;
        color: var(--color-dark);
      }

      main {
        margin-top: 60px;
      }

      .insights {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .table-wrapper {
        margin: 0 -10px;
        padding: 0 10px;
      }

      .wallet-summary {
        padding: 15px;
      }

      .card-actions {
        flex-wrap: wrap;
      }

      .action-btn {
        flex: 1;
        min-width: 120px;
        justify-content: center;
      }
    }

    @media screen and (max-width: 768px) {
      .dash-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
        margin-bottom: 15px;
      }

      .date {
        width: 100%;
      }

      .date input {
        width: 100%;
        padding: 10px;
      }

      .card {
        padding: 15px;
      }

      .card h1 {
        font-size: 1.3rem;
      }

      .card h3 {
        font-size: 0.85rem;
      }

      .card .material-icons {
        font-size: 24px;
      }

      table {
        font-size: 0.9rem;
      }

      th, td {
        padding: 10px 8px;
        white-space: nowrap;
      }

      .wallet-card {
        padding: 12px;
      }

      .card-balance h1 {
        font-size: 1.5rem;
      }

      .action-btn {
        padding: 6px 12px;
        font-size: 0.9rem;
      }
    }

    @media screen and (max-width: 480px) {
      .container {
        padding: 8px;
      }

      .menu-btn {
        top: 10px;
        left: 10px;
        width: 36px;
        height: 36px;
      }

      main {
        margin-top: 50px;
        padding: 12px;
      }

      .card {
        padding: 12px;
      }

      .card h1 {
        font-size: 1.2rem;
      }

      .card h3 {
        font-size: 0.8rem;
      }

      .card .material-icons {
        font-size: 20px;
      }

      .card small {
        font-size: 0.75rem;
      }

      table {
        font-size: 0.8rem;
      }

      th, td {
        padding: 8px 6px;
      }

      .wallet-card {
        padding: 10px;
      }

      .card-balance h1 {
        font-size: 1.3rem;
      }

      .action-btn {
        padding: 5px 10px;
        font-size: 0.8rem;
        min-width: 100px;
      }

      .profile-photo .material-icons {
        font-size: 28px;
      }

      .info p {
        font-size: 0.9rem;
      }

      .info small {
        font-size: 0.75rem;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) {
      .card:hover {
        transform: none;
      }

      .sidebar-nav a:hover:not(.active) {
        background-color: transparent;
      }

      .action-btn:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .view-all:hover {
        text-decoration: none;
      }
    }
    </style>
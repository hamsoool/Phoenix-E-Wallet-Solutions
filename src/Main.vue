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
    
   < <router-view/>>
    </template>
    
    <script> 
    
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
    
    /* Responsive Styles */
    @media screen and (max-width: 1200px) {
      .container {
        grid-template-columns: 70px 1fr 250px;
      }
    
      #sidebar {
        width: 70px;
      }
    
      .sidebar-nav h3 {
        display: none;
      }
    
      .insights {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    @media screen and (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
        width: 100%;
        padding: 10px;
      }
    
      #sidebar {
        position: fixed;
        left: -100%;
        width: 240px;
        height: 100vh;
        top: 0;
        z-index: 100;
        transition: var(--transition);
      }
    
      #sidebar.show {
        left: 0;
      }
    
      .sidebar-nav h3 {
        display: inline;
      }
    
      .close-btn {
        display: inline-block;
      }
    
      .menu-toggle {
        display: inline-block;
      }
    
      .insights {
        grid-template-columns: 1fr;
      }
    
      main {
        margin-top: 70px;
      }
    
      .right-panel {
        position: static;
        height: auto;
        margin-bottom: 20px;
        width: 100%;
      }
    
      .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: var(--color-white);
        z-index: 99;
        box-shadow: var(--box-shadow);
      }
    
      .info {
        display: none;
      }
    }
    </style>
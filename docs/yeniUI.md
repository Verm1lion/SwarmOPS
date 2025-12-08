<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kanban Board - SwarmOPS</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
      .material-symbols-outlined {
        font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24
      }
    </style>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#2badee",
              "background-light": "#f6f7f8",
              "background-dark": "#101c22",
              "glass-light": "rgba(255, 255, 255, 0.4)",
              "glass-dark": "rgba(30, 41, 59, 0.5)",
              "border-light": "rgba(255, 255, 255, 0.6)",
              "border-dark": "rgba(255, 255, 255, 0.1)",
              "text-light-primary": "#0d171b",
              "text-dark-primary": "#e7eff3",
              "text-light-secondary": "#4c809a",
              "text-dark-secondary": "#94a3b8",
            },
            fontFamily: {
              "display": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            boxShadow: {
              'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              'deep-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
            },
            backdropBlur: {
              'xl': '20px',
            }
          },
        },
      }
    </script>
</head>
<body class="font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary antialiased">
<div class="relative flex h-screen w-full flex-col overflow-hidden">
<!-- Animated Background -->
<div class="absolute inset-0 z-[-1] overflow-hidden">
<div class="absolute -top-1/4 -left-1/4 size-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"></div>
<div class="absolute -bottom-1/4 -right-1/4 size-1/2 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/10"></div>
</div>
<!-- Top Navigation Bar -->
<header class="flex-shrink-0 border-b border-solid border-border-light dark:border-border-dark bg-glass-light/80 dark:bg-glass-dark/80 backdrop-blur-xl px-6">
<div class="flex items-center justify-between h-16">
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-text-light-primary dark:text-dark-primary">
<span class="material-symbols-outlined text-primary text-3xl">hub</span>
<h1 class="text-xl font-bold tracking-[-0.015em]">SwarmOPS</h1>
</div>
<div class="hidden md:flex items-center gap-2">
<div class="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
<h2 class="text-lg font-bold">Swarm_WEB_DEV</h2>
<span class="text-xs font-bold bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 px-2 py-0.5 rounded-full">ACTIVE</span>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center">
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-800 -mr-4" data-alt="User avatar 1" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDS_wTn2UKrQtAajLDA5VX6c_h4mMwosV9o24TR7n1rjNTXqQ7VnmwHVu_RBCjHxyLsvXisVotkxhKeqTzuQgaOjABNfd1B8k_6z9PODL8sGpvU1pMjzPQqyuKWI0Htt9GJNs8lf9slrBROKvtBiwUOYAkvtPesZ2L78v0mJ2zJq8yxT5RN7OBVgBDVd3en7TTmA9p5U149QXo_7kO0y2satGBV_9cTKofmXvJiYzYuqrf1ZKkG2oLk86kSDt1a7HrieHv8uoAqknU");'></div>
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-800 -mr-4" data-alt="User avatar 2" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVSFDjnwiSR28BeTBe593J1sOKLPt5Fpi7IzZ-H_C9lnlMQSwauxe-EG9KHdqOwF8N1GcshlD8qgswOVpc43H2OWOzRyRHeR_HqwF6woKNTFEQfP2w2Xgg-gjLWHgzqOI5DY8jrRaTS6vVmwtcEBDIoywmXog8SOmD-5F-QbFF4fSAaJ9TRFm6rxY7ESWFA3ZdhEIn7MEfMSe-FcBn41cpjXKU_VVv-Cl_89PdgjR8cRy_mu5GvSfXUGdG-z7VqeK-rVDx3YNe-3o");'></div>
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-800 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-sm font-bold text-text-light-secondary dark:text-dark-secondary">
                            +2
                        </div>
</div>
<div class="flex gap-2">
<button class="flex items-center justify-center size-10 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">
<span class="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary text-2xl">notifications</span>
</button>
<button class="flex items-center justify-center size-10 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">
<span class="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary text-2xl">dark_mode</span>
</button>
</div>
<div class="size-10 rounded-full bg-cover bg-center" data-alt="Main user avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuChLcufPpNceAJfNbBTRAQXb2b1nWkDPwA2KuUYE2YIz4h8fTbUuhQ7GYvtAxa7OO_aado7m9SOS1OAeXPR9H3eEEG-6uMTsSbr_2r2DNIH4LWFgEXEVNpQjSWvzgXUh5yeyCjoD0yLrvLhePHrxUfyprQ4KH_0JhQBbscPnHMxgfTCCiVSVoS4BiL2EmJL1l8aShArDRZnyE-EyC5SWiZhlsC0p52aHLPfAKZOvs2dW48dZTmPq3spItmZpPL4LbX3WOyN1sFQXUs");'></div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex flex-1 overflow-hidden">
<!-- Kanban Board -->
<div class="flex-1 flex flex-col p-6 overflow-hidden">
<div class="flex-1 flex gap-6 overflow-x-auto pb-4">
<!-- Column: Ideas -->
<div class="w-[320px] flex-shrink-0 flex flex-col">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
<h3 class="font-bold text-lg">Ideas</h3>
</div>
<span class="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">3</span>
</div>
<div class="flex flex-col gap-4 p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 h-full">
<!-- Task Card -->
<div class="rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3">
<h4 class="font-bold">Brainstorm new logo concepts</h4>
<div class="flex items-center justify-between text-sm text-text-light-secondary dark:text-dark-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">chat_bubble_outline</span>
<span>2</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span>
<span>May 10</span>
</div>
<div class="size-6 rounded-full bg-cover bg-center" data-alt="User avatar 1" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5BqnynVPvLaOnnshkvtvBeVvObFHLyr4m4zpWNe1ioFZztP3qef7Xd1MJxMI9o6Ibz7DRgUNyKf67KVBHWq_Zh_xP6vO3vg-f-S9uXu4D3z2-9uw1ks6R1fNJHJC3S99pzhsqt4tbaMmaySSDtKyAjeOEVZUdJzrMfnyThkflp-9NTBXsW5KVKAp2QSZa25CLf_Cjloah9GGtUmyVC_b0ZlK9CjNXLVHfyMy7ddOeQ-qMlfTQO2OX6eNXPSb8IqHCAtAFG1qOyWY");'></div>
</div>
</div>
</div>
</div>
<!-- Column: To-Do -->
<div class="w-[320px] flex-shrink-0 flex flex-col">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
<h3 class="font-bold text-lg">To-Do</h3>
</div>
<span class="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">4</span>
</div>
<div class="flex flex-col gap-4 p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 h-full">
<!-- Task Card -->
<div class="rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3">
<h4 class="font-bold">Develop user authentication flow</h4>
<div class="flex items-center gap-1">
<span class="text-xs font-bold bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 px-2 py-0.5 rounded-full">High</span>
</div>
<div class="flex items-center justify-between text-sm text-text-light-secondary dark:text-dark-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">chat_bubble_outline</span>
<span>5</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span>
<span>Apr 28</span>
</div>
<div class="size-6 rounded-full bg-cover bg-center" data-alt="User avatar 2" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBy9N-nySbNv4oSPWc-fBRhxNm4MiHCmWk00Sb4a8WzH361CdXd-5t6ga3O4TwTGXCXnk4UfPxFde_CAA4rnDFXxJeftBt_ZkJaSugWBwg4A6rRnmgqUSuv3rkEnq702nzFxNGs_R1H2C-bAph102Kayr2NRXtTvEURYQN4LzRIApcRKkmwyhHsCNXsFCTgw17nbWCjy37ZtGxBtduH7w1GwOQF3ml99hZX8EKQNMZn2tYZ4t7f8Uz6YNA_r1M38CwbqgzIcjNf-WI");'></div>
</div>
</div>
<!-- Task Card -->
<div class="rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3">
<h4 class="font-bold">Design settings page UI</h4>
<div class="flex items-center gap-1">
<span class="text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300 px-2 py-0.5 rounded-full">Medium</span>
</div>
<div class="flex items-center justify-between text-sm text-text-light-secondary dark:text-dark-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">chat_bubble_outline</span>
<span>1</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span>
<span>May 2</span>
</div>
<div class="size-6 rounded-full bg-cover bg-center" data-alt="User avatar 1" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDePKghTAo4GoGHYwo_WJav8SThkhkJjNA0_OoH2IJbMZKJFJPpWbxRYx4bzUwFkeJxYWT3cRQggMEwR1pCscQcr2ssbW9c5Nt6tzfEkGbABz2l08SKvtEbEADsomZvSbTGUPSxTRzTaMkCRoJOA-nxqDFCcpLaIguFEDceVQwqFNHAgrVx7A-hAPApApZM42Jlro7yE4DR8MN4VuhUJGeCRbnFFmNDM-1J5PWxvME2tAWsk1nKOgtWXYvLiMdzw4WBxlfY1n0T02s");'></div>
</div>
</div>
</div>
</div>
<!-- Column: In Progress -->
<div class="w-[320px] flex-shrink-0 flex flex-col">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
<h3 class="font-bold text-lg">In Progress</h3>
</div>
<span class="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">2</span>
</div>
<div class="flex flex-col gap-4 p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 h-full">
<!-- Task Card -->
<div class="rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3">
<h4 class="font-bold">Setup CI/CD pipeline</h4>
<div class="flex items-center gap-1">
<span class="text-xs font-bold bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 px-2 py-0.5 rounded-full">High</span>
</div>
<div class="flex items-center justify-between text-sm text-text-light-secondary dark:text-dark-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">chat_bubble_outline</span>
<span>12</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span>
<span>Apr 25</span>
</div>
<div class="size-6 rounded-full bg-cover bg-center" data-alt="User avatar 2" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhHqsYgfAV0-i6rzVPJ_lMC_ow6jFCCKl6oZqMj66My3ns3m8fjnWfrz6ozVidZaP2ny_wv16DsbQDG8W6N14edO3ysofHyhCCXad98FMKWzPqtiMUE6Zk-00ZQxUrqzOYJv_2DB0rnJcEX7NuKHEC7kHPSd8dYvpaRhFHvr82z_xSusntv6D0yZP9LOADLc93NKLvnCz8EvXwJhpAySVlaAhDzSJKrtzbbQe3H2_esVQw6ugVAcgvE1xcIyPqMSs2PAPnUooO0bo");'></div>
</div>
</div>
</div>
</div>
<!-- Column: Done -->
<div class="w-[320px] flex-shrink-0 flex flex-col">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
<h3 class="font-bold text-lg">Done</h3>
</div>
<span class="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">1</span>
</div>
<div class="flex flex-col gap-4 p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 h-full">
<!-- Task Card -->
<div class="rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3">
<h4 class="font-bold">Project kickoff meeting</h4>
<div class="flex items-center justify-between text-sm text-text-light-secondary dark:text-dark-secondary">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">chat_bubble_outline</span>
<span>8</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-base">calendar_today</span>
<span>Apr 15</span>
</div>
<div class="size-6 rounded-full bg-cover bg-center" data-alt="User avatar 1" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAPwKze-yeZ85Hhny2OJKi7mjrkIxBt6OLfTbgegQfTmIihR2dgB-5uvnaGg_hs9dxHxW2T0_Futu4AyBO8qqwENkHdVjGPumH0Cf2IOHNl-JHQFRvlzLut8fo0Z0J8k-G2plz57vnktydjzv93Xu3efv64wHpfINamTpW-5voyyAOPRKaJq_zFaDUWcwd-1lT9UW6JbPOxiVMCJ4mw7wK8jyeNoZcanAd1LFWQ9_9unXxdgdThAk2S8kn65PZvw47TCVq_MqBM-mw");'></div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Project Panel -->
<aside class="w-[350px] flex-shrink-0 border-l border-solid border-border-light dark:border-border-dark bg-glass-light/80 dark:bg-glass-dark/80 backdrop-blur-xl p-6 overflow-y-auto">
<div class="flex flex-col gap-6">
<!-- Accordions -->
<details class="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open="">
<summary class="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
<p class="font-bold">Project Overview</p>
<span class="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div class="px-4 pb-4">
<p class="text-sm text-text-light-secondary dark:text-dark-secondary leading-relaxed">A next-level, ultra-modern web UI for a collaborative Kanban app called "SwarmOPS".</p>
</div>
</details>
<details class="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open="">
<summary class="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
<p class="font-bold">Join Code</p>
<span class="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div class="px-4 pb-4 space-y-3">
<div class="relative flex items-center justify-center p-4 rounded-lg bg-slate-200/50 dark:bg-slate-900/50 overflow-hidden">
<p class="font-mono text-lg font-bold tracking-widest blur-sm select-none">SW-8XV2K9</p>
</div>
<div class="flex gap-3">
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-dark-primary gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
<span class="material-symbols-outlined text-xl">visibility</span>
<span class="truncate">Show / Hide</span>
</button>
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-dark-primary gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
<span class="material-symbols-outlined text-xl">content_copy</span>
</button>
</div>
</div>
</details>
<details class="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open="">
<summary class="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
<p class="font-bold">Quick Actions</p>
<span class="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div class="px-4 pb-4 flex flex-col gap-3">
<button class="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-primary text-white gap-2 text-sm font-bold hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined text-xl">add</span>
<span>New Task</span>
</button>
<button class="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-dark-primary gap-2 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
<span class="material-symbols-outlined text-xl">settings</span>
<span>Project Settings</span>
</button>
<button class="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-dark-primary gap-2 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
<span class="material-symbols-outlined text-xl">archive</span>
<span>Archive Project</span>
</button>
</div>
</details>
<details class="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open="">
<summary class="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
<p class="font-bold">Statistics</p>
<span class="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div class="px-4 pb-4 flex flex-col gap-3">
<!-- Stat Widget -->
<div class="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
<div>
<p class="text-sm text-text-light-secondary dark:text-dark-secondary">Active Tasks</p>
<p class="text-2xl font-bold">6</p>
</div>
<div class="w-20 h-8" data-alt="Sparkline chart showing an upward trend">
<svg fill="none" viewbox="0 0 80 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 28C10.5 24.5 15.5 12.5 25 10C34.5 7.5 38 18 47 16C56 14 59.5 2 68.5 2" stroke="#2badee" stroke-linecap="round" stroke-width="2"></path></svg>
</div>
</div>
<!-- Stat Widget -->
<div class="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
<div>
<p class="text-sm text-text-light-secondary dark:text-dark-secondary">Overdue Tasks</p>
<p class="text-2xl font-bold text-red-500 dark:text-red-400">1</p>
</div>
<div class="w-20 h-8" data-alt="Sparkline chart showing a flat trend">
<svg fill="none" viewbox="0 0 80 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 16H25L47 16L68.5 16" stroke="#f87171" stroke-linecap="round" stroke-width="2"></path></svg>
</div>
</div>
<!-- Stat Widget -->
<div class="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
<div>
<p class="text-sm text-text-light-secondary dark:text-dark-secondary">Completed This Week</p>
<p class="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
</div>
<div class="w-20 h-8" data-alt="Sparkline chart showing a sharp upward trend">
<svg fill="none" viewbox="0 0 80 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 30C10.5 28.5 15.5 20.5 25 22C34.5 23.5 38 11 47 11C56 11 59.5 4 68.5 2" stroke="#4ade80" stroke-linecap="round" stroke-width="2"></path></svg>
</div>
</div>
</div>
</details>
</div>
</aside>
</main>
</div>
</body></html>
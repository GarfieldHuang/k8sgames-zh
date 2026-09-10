# K8s Games

Learn Kubernetes by playing. Deploy pods, fix CrashLoopBackOff, type real kubectl commands — all in a 3D sim that runs in your browser.

**[Play Now at k8sgames.com](https://k8sgames.com)** | **[K8s Draw — 3D Architecture Diagrams](https://k8sgames.com/draw)**

![K8s Games — 3D Kubernetes cluster simulation in the browser](screenshot.png)

## Get Started

Visit **[k8sgames.com](https://k8sgames.com)** and pick a mode. No install, no signup, no build step.

Just here to diagram? Go straight to **[k8sgames.com/draw](https://k8sgames.com/draw)** — drag K8s resources onto a 3D canvas, draw connections, export YAML or PNG, and share via URL.

Or run locally:

```bash
git clone https://github.com/rohitg00/k8sgames.git
cd k8sgames
python3 -m http.server 8080
# Open http://localhost:8080
```

## How to Play

1. Pick a game mode from the main menu
2. Click resources from the left palette to place them in your cluster
3. Drag resources to reposition them anywhere
4. Click any resource to inspect it (status, YAML, kubectl describe)
5. Right-click for actions (Scale, Delete, Logs, Restart)
6. Press `/` to open the kubectl command bar
7. Handle incidents as they appear — diagnose and fix like a real SRE
8. Press `?` anytime for help

## Game Modes

| Mode | What You Do |
|------|-------------|
| **Campaign** | 20 levels across 5 chapters. Learn pods, deployments, networking, storage, and production K8s |
| **Chaos** | Endless survival. Incidents escalate until your cluster breaks. How long can you last? |
| **Sandbox** | Free build. Design any cluster, get scored 0-100 by the Architecture Advisor |
| **Challenges** | 10 timed scenarios. Deploy apps, fix outages, race the clock |

### K8s Draw (`/draw`)

A 3D Kubernetes architecture whiteboard. Like Excalidraw but for K8s.

- Drag-drop 21 resource types onto a 3D canvas
- Draw connection lines between resources
- Double-click to rename any resource
- Auto-layout organizes by tier (Nodes, Workloads, Networking, Storage, RBAC)
- Export as YAML (with correct apiVersions) or PNG
- Share diagrams via URL — one-click copy, open anywhere
- Edit properties: name, namespace, labels, replicas
- Right-click to delete, `Del` key for selected

No game logic, no incidents, no scoring — just diagramming.

## Controls

| Input | Action |
|-------|--------|
| `/` | kubectl command bar |
| `?` | Help / How to play |
| `Space` | Pause / Resume |
| `M` | Metrics dashboard |
| `Esc` | Back to menu |
| `1-9` | Quick-select resource |
| Left-click | Select resource |
| Left-drag | Move resource or rotate camera |
| Right-click | Context menu |
| Right-drag | Pan |
| Scroll | Zoom |

Bottom toolbar: **Auto-Align** (K8s architecture layout) | **Reset View** | **YAML** (export cluster) | **Help**

## What's In It

**25 K8s resources** — Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, CronJob, Service, Ingress, NetworkPolicy, ConfigMap, Secret, PVC, PV, StorageClass, Node, Namespace, HPA, ResourceQuota, PodDisruptionBudget, ServiceAccount, Role, ClusterRole, RoleBinding, ClusterRoleBinding. Each has a unique 3D shape, color, and real K8s behavior.

**29 incidents** — OOMKilled, CrashLoopBackOff, ImagePullBackOff, node NotReady, DNS failures, PVC pending, API throttling, rollout stuck, certificate expiry, HPA flapping, and more. Investigate with kubectl describe/logs, then fix.

**kubectl command bar** — type real commands: `get pods`, `describe deployment nginx`, `scale deployment nginx --replicas=3`, `logs pod-1`, `rollout status`, `drain node-1`. Tab completion included.

**Visual connections** — animated lines show ownership chains (Deployment -> ReplicaSet -> Pod) and network routing (Service -> Pods) based on label selectors. Place a Service and pick which Deployment it connects to.

**Edit resources** — click Edit on any resource to modify labels, replicas, selectors, and service types. Quick-connect buttons let you wire a Service to an existing Deployment in one click.

**Architecture Advisor** — scores your cluster design across HA, security, scalability, cost, and 6 other categories.

**40 achievements** and a 30-level XP system from Novice to CKA-ready.

**RBAC simulation** — ServiceAccounts, Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings with real rule definitions and wildcard detection.

## Tech

Three.js r152 + Tailwind CSS CDN + vanilla ES6 modules. No build step, no dependencies, no bundler. ~50K lines across 90+ files.

## License

Apache-2.0

---

# Fork Notes — Chinese localization + non-blocking level results

This is a fork of [rohitg00/k8sgames](https://github.com/rohitg00/k8sgames) (Apache-2.0).
All credit for the game itself goes upstream; this fork adds two things and still has
no build step — everything is plain ES modules.

這是 [rohitg00/k8sgames](https://github.com/rohitg00/k8sgames) 的分支，加了繁體／簡體中文介面，
並且讓過關時的成績視窗不再蓋住畫面。

## 1. Level results no longer cover the screen

Clearing a level used to immediately throw up a full-screen modal with **Menu** /
**Next Level**, hiding the cluster you had just finished building.

Now finishing a level shows a small non-blocking banner at the top of the screen
(stars, level name, time/efficiency/XP) and leaves the cluster fully visible.

Re-open the full results dialog any time via:

| Way | Where |
|-----|-------|
| **View Results** | button on the banner |
| **Results** | green star button in the bottom toolbar |
| `R` | keyboard shortcut |

The dialog itself gained a **Keep Viewing** button that just closes it, and `Esc`
closes it too (instead of dumping you back to the main menu). **Next Level** hides
itself on the last level. The banner has an `×` to dismiss it; the toolbar button
and `R` keep working until you leave the level.

Code: `index.html` — `_fillLevelResult`, `_showResultBanner`, `showLevelResults`,
`hideLevelResults`, `clearLevelResult`. Styles: `.result-banner` in `style.css`.

## 2. Traditional / Simplified Chinese

A language picker (English / 繁體中文 / 简体中文) sits under the main menu and in
Settings. The choice is stored in `localStorage` under `k8sgames.lang`.

**Kubernetes terminology stays in English on purpose** — resource kinds (`Pod`,
`Deployment`, `Service`…), `kubectl` commands, field names (`spec.replicas`), and
incident codes (`CrashLoopBackOff`, `OOMKilled`). Those are the things you are here
to learn; translating them would make the game useless as practice.

Simulated tool output is never touched either: the `kubectl` terminal
(`#cmd-output`, marked `data-i18n-skip`) and every `<pre>` / `<code>` block — so
the YAML and `describe` tabs stay byte-identical to real `kubectl`.

### How it works

`js/i18n/I18n.js` translates the live DOM: it walks text nodes and the `title` /
`placeholder` / `aria-label` attributes, and a `MutationObserver` re-translates
anything the game renders later. Each node remembers the English it came from, so
switching languages — including back to English — is lossless and repeatable.

Translation runs in the observer's own microtask rather than on a timer or
`requestAnimationFrame`; both are throttled in a background tab, which would leave
freshly rendered English on screen. Cost is ~0.2 ms per second of gameplay.

To exclude a subtree from translation, add `data-i18n-skip` to it.

### Editing translations

`js/i18n/dict.zh-TW.js` is the **only file you edit by hand.** It holds the
Traditional Chinese dictionary plus `ZH_TW_PATTERNS` for strings with numbers in
them (`Completed in 42s with 100% efficiency…`).

`js/i18n/dict.zh-CN.js` is **generated** — do not edit it. After changing zh-TW:

```bash
cd tools && node gen-zh-cn.mjs
```

The generator applies a Taiwan→Mainland vocabulary map (網路→网络, 程式→程序,
記憶體→内存, 預設→默认, 叢集→集群 …) before a Traditional→Simplified character
pass, and fails loudly if any Traditional character would survive into the output.

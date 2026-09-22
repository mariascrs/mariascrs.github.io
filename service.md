---
title: Service
intro: Organisation, reviewing, teaching and outreach.
---
## Organisation

### Seminars
* [The Isogeny Club](https://isogeny.club/), co-organise an online seminar series on isogeny-based cryptography.
* [UCL Information Security Seminars](https://sec.cs.ucl.ac.uk/seminars/), co-organised the UCL Information Security seminar series (2020-2024).

### Conferences and Workshops
* [Women & Allies in Cryptography Workshop](https://wainc-ec2026.sciencesconf.org/), co-organising as an affiliate event at Eurocrypt 2026 in Rome, Italy.
* [The Isogeny Club Brainstorm Days 2026](https://isogeny.club/eurocrypt), co-organising as an affiliate event at Eurocrypt 2026 in Rome, Italy.
* [Decrypting Diversity Summit](https://decryptingdiversity.com/), co-organised a summit with the goal of promoting diversity, inclusion, and gender equality within the cryptography community.
* [The Isogeny Club Brainstorm Days 2025](https://isogeny.club/eurocrypt), co-organised as an affiliate event at Eurocrypt 2025 in Madrid, Spain.
* **The Isogeny Club Brainstorm Days 2024**, co-organised as an affiliate event at Eurocrypt 2024 in Zurich, Switzerland.
* [CrossFyre '23](https://sites.google.com/view/crossfyre2023/), co-organised as an affiliate event at Eurocrypt 2023 in Lyon, France.

### Associations
* [Women & Allies in Cryptography Association](https://www.womenincryptography.com/association/), a member of the Collegial Council.

## Reviewing
### Program Committee
* **2026**: CRYPTO, WAIFI, Asiacrypt, [MaGIC workshop](https://magic-workshop.github.io/)

### Sub-reviewer
* **2026**: ANTS XVII
* **2025**: CRYPTO, Eurocrypt
* **2024**: Eurocrypt, ANTS XVI, CRYPTO, CiC, Asiacrypt
* **2023**: Asiacrypt
* **2022**: PKC, Asiacrypt

## Teaching
* 2 - 13 March 2026: Invited lecturer at [CIMPA Summer School](https://sites.google.com/view/agmiit-2026/home?authuser=0) in Santa Fe, Argentina
* Term 1, 2021 - 2023: Teaching assistant for [Introduction to Cryptography (COMP0025)](https://www.ucl.ac.uk/module-catalogue/modules/introduction-to-cryptography/COMP0025) at UCL

## Outreach talks

{% assign outreach = site.data.talks | where: "category", "outreach" %}
<ul class="talk-list">
{%- for t in outreach %}{% include talk.html talk=t %}{% endfor %}
</ul>

---
description: Создать Pull Request на GitHub. Принимает аргументы: название PR и ветка (опционально). Использовать при запросе создать PR, открыть pull request, запушить ветку.
user-invocable: true
allowed-tools: Bash(git *) Bash(gh *)
argument-hint: [title] [base-branch, default main]
model: claude-sonnet-4-6
effort: low
---

Создай Pull Request на GitHub.

## Аргументы скилла

Аргументы передаются после `/pr` через пробел:
- $0 — название PR (title).
- $1 — имя целевой ветки.

## Подготовка

1. проверь что ветка готова:
`bash ${CLAUDE_SKILL_DIR}/scripts/validate.sh` 
2. Получи diff от базовой ветки:
`git diff ${ARGUMENTS:-main}..HEAD`
3. Получи список коммитов:
`git log ${ARGUMENTS:-main}..HEAD --oneline`

## Задача
Используя данные выше, заполни шаблон из [template.md](template.md)

Посмотри пример хорошего PR:
[examples/good-pr.md](examples/good-pr.md)

## Создание PR
Создай PR командой:

gh pr create \
  --title "$0 или сгенерированный title" \
  --body "Заполненный шаблон"
  --base "${ARGUMENTS:-main}"


## Правила

- Title если не передан то в формате Conventional Commits: `<type>(<scope>): описание на русском`.
- Никогда не пушить в `main` напрямую.
- После создания обязательно вернуть URL PR пользователю.
- Если PR для этой ветки уже существует — сообщить пользователю и показать ссылку через `gh pr view --web` или `gh pr view <branch>`.

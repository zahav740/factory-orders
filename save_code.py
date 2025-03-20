import os

# Пути к backend и frontend
BACKEND_SRC = r"C:\Users\apule\Downloads\333\genesys-app\backend\src"
FRONTEND_SRC = r"C:\Users\apule\Downloads\333\genesys-app\frontend\src"

# Файлы, куда будет записан код
BACKEND_FILE = "backend.txt"
FRONTEND_FILE = "frontend.txt"

# Расширения файлов, которые будем сохранять
ALLOWED_EXTENSIONS = {".ts", ".js", ".json", ".tsx", ".jsx", ".html", ".css", ".scss"}

def save_code_from_dir(directory, output_file):
    """
    Проходит по всем файлам в директории, читает их содержимое и записывает в один файл.
    """
    with open(output_file, "w", encoding="utf-8") as out_file:
        for root, _, files in os.walk(directory):
            for file in files:
                if any(file.endswith(ext) for ext in ALLOWED_EXTENSIONS):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                            out_file.write(f"### Файл: {file_path}\n")
                            out_file.write(content + "\n\n" + "="*80 + "\n\n")
                    except Exception as e:
                        print(f"Ошибка чтения {file_path}: {e}")

# Запускаем обработку
save_code_from_dir(BACKEND_SRC, BACKEND_FILE)
print(f"✅ Код из backend сохранён в {BACKEND_FILE}")

save_code_from_dir(FRONTEND_SRC, FRONTEND_FILE)
print(f"✅ Код из frontend сохранён в {FRONTEND_FILE}")

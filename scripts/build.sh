#!/bin/bash

echo "🔨 Iniciando build da extensão..."

rm -rf dist
mkdir -p dist

echo "📦 Copiando arquivos..."
cp -r src/* dist/

echo "🧹 Minimizando JavaScript..."
find dist -name "*.js" -not -path "*/node_modules/*" | while read file; do
  npx terser "$file" -c -m -o "$file.min"
  mv "$file.min" "$file"
done

echo "🎨 Minimizando CSS..."
find dist -name "*.css" | while read file; do
  npx cleancss -o "$file" "$file"
done

echo "✅ Build concluído! Pasta 'dist/' pronta para produção."

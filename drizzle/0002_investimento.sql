-- "Guardar dinheiro" passa a ser investimento; "entrada" agora é dinheiro que entra na conta.
UPDATE "expense" SET "kind" = 'investimento' WHERE "kind" = 'entrada';

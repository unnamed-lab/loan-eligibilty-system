.PHONY: help train export up down logs test

help:         ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

train:        ## Train models + write artifacts (ml/)
	cd ml/src && python train.py && python evaluate.py

export:       ## Export deployed model to ONNX (+ parity) and fan out to services
	cd ml/src && python export_onnx.py
	cp ml/artifacts/model.onnx inference-engine/models/
	cp ml/artifacts/xgb_model.json shap-service/artifacts/

up:           ## Bring up the whole system (build + run)
	docker compose up --build

down:         ## Stop the system
	docker compose down

logs:         ## Tail all service logs
	docker compose logs -f

test:         ## Run the gateway test suite
	cd api-gateway && pnpm test

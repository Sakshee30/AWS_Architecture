resource "aws_vpc" "this" {
  cidr_block           = var.cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = merge(var.tags, { Name = var.name })
}

resource "aws_subnet" "public" {
  for_each                = { for i, cidr in var.public_subnet_cidrs : i => cidr }
  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value
  availability_zone       = var.azs[tonumber(each.key)]
  map_public_ip_on_launch = true
  tags                    = merge(var.tags, { Tier = "public" })
}

resource "aws_subnet" "private_app" {
  for_each          = { for i, cidr in var.private_app_subnet_cidrs : i => cidr }
  vpc_id            = aws_vpc.this.id
  cidr_block        = each.value
  availability_zone = var.azs[tonumber(each.key)]
  tags              = merge(var.tags, { Tier = "application" })
}

resource "aws_subnet" "isolated_data" {
  for_each          = { for i, cidr in var.isolated_data_subnet_cidrs : i => cidr }
  vpc_id            = aws_vpc.this.id
  cidr_block        = each.value
  availability_zone = var.azs[tonumber(each.key)]
  tags              = merge(var.tags, { Tier = "data" })
}
